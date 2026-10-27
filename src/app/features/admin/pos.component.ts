
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ApiService } from '../../core/services/api.service';
import { apiUrl } from '../../core/config/api.config';
import {
  Producto,
  ProductoTalla
} from '../../core/models/models';

type MedioPago = 'EFECTIVO' | 'YAPE' | 'TARJETA';

interface LineaPos {
  varianteId: number;
  productoId: number;
  nombre: string;
  talla: string;
  precioCentavos: number;
  cantidad: number;
  stockDisponible: number;
}

interface VentaPosSolicitud {
  idempotencia: string;
  cliente: string;
  items: {
    varianteId: number;
    cantidad: number;
  }[];
  medio: MedioPago;
}

interface VentaPosRespuesta {
  id: number;
  tipo: string;
  estado: string;
  pagoEstado: string;
  total: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PosComponent {

  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  readonly productos = signal<Producto[]>([]);
  readonly carrito = signal<LineaPos[]>([]);
  readonly busqueda = signal('');

  readonly cargando = signal(false);
  readonly enviando = signal(false);

  readonly errorProductos = signal('');
  readonly errorVenta = signal('');

  readonly resultado = signal<VentaPosRespuesta | null>(null);

  // Se conserva el mismo UUID y exactamente el mismo
  // contenido si debemos reintentar una solicitud.
  readonly intentoPendiente =
    signal<VentaPosSolicitud | null>(null);

  cliente = '';
  medio: MedioPago = 'EFECTIVO';

  readonly productosFiltrados = computed(() => {
    const texto = this.busqueda()
      .trim()
      .toLocaleLowerCase();

    if (!texto) {
      return this.productos();
    }

    return this.productos().filter(producto =>
      producto.nombre.toLocaleLowerCase().includes(texto)
      || String(producto.idProducto).includes(texto)
    );
  });

  readonly unidades = computed(() =>
    this.carrito().reduce(
      (total, linea) => total + linea.cantidad,
      0
    )
  );

  readonly totalCentavos = computed(() =>
    this.carrito().reduce(
      (total, linea) =>
        total + linea.precioCentavos * linea.cantidad,
      0
    )
  );

  readonly bloqueado = computed(() =>
    this.enviando()
    || this.intentoPendiente() !== null
    || this.resultado() !== null
  );

  constructor() {
    this.cargarProductos();
  }

  cargarProductos(): void {
    if (this.cargando()) {
      return;
    }

    this.cargando.set(true);
    this.errorProductos.set('');

    this.api.productos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: productos => {
          this.productos.set(productos);
          this.cargando.set(false);
        },
        error: error => {
          this.errorProductos.set(
            this.mensajeError(
              error,
              'No se pudo cargar el catálogo.'
            )
          );
          this.cargando.set(false);
        }
      });
  }

  precioCentavos(producto: Producto): number {
    const precio = producto.precioOferta
      ?? producto.precio;

    return Math.round(Number(precio) * 100);
  }

  dinero(centavos: number): string {
    return (centavos / 100).toLocaleString(
      'es-PE',
      {
        style: 'currency',
        currency: 'PEN'
      }
    );
  }

  cantidadEnCarrito(varianteId: number): number {
    return this.carrito()
      .find(linea => linea.varianteId === varianteId)
      ?.cantidad ?? 0;
  }

  agregar(
    producto: Producto,
    talla: ProductoTalla
  ): void {

    if (this.bloqueado()) {
      return;
    }

    const stock = talla.stockDisponible;
    const existente = this.cantidadEnCarrito(
      talla.idProductoTalla
    );

    if (stock <= 0 || existente >= stock) {
      return;
    }

    const precio = this.precioCentavos(producto);

    if (!Number.isSafeInteger(precio) || precio <= 0) {
      this.errorVenta.set(
        'El producto no tiene un precio válido.'
      );
      return;
    }

    this.errorVenta.set('');

    this.carrito.update(lineas => {
      const indice = lineas.findIndex(
        linea =>
          linea.varianteId === talla.idProductoTalla
      );

      if (indice >= 0) {
        return lineas.map((linea, i) =>
          i === indice
            ? {
                ...linea,
                cantidad: linea.cantidad + 1
              }
            : linea
        );
      }

      return [
        ...lineas,
        {
          varianteId: talla.idProductoTalla,
          productoId: producto.idProducto,
          nombre: producto.nombre,
          talla: talla.talla,
          precioCentavos: precio,
          cantidad: 1,
          stockDisponible: stock
        }
      ];
    });
  }

  cambiarCantidad(
    varianteId: number,
    diferencia: number
  ): void {

    if (this.bloqueado()) {
      return;
    }

    this.carrito.update(lineas =>
      lineas
        .map(linea => {
          if (linea.varianteId !== varianteId) {
            return linea;
          }

          const cantidad = Math.min(
            linea.stockDisponible,
            linea.cantidad + diferencia
          );

          return {
            ...linea,
            cantidad
          };
        })
        .filter(linea => linea.cantidad > 0)
    );
  }

  quitar(varianteId: number): void {
    if (this.bloqueado()) {
      return;
    }

    this.carrito.update(lineas =>
      lineas.filter(
        linea => linea.varianteId !== varianteId
      )
    );
  }

  registrarVenta(): void {
    if (this.enviando() || this.resultado()) {
      return;
    }

    let solicitud = this.intentoPendiente();

    if (solicitud === null) {
      const nombre = this.cliente.trim();

      if (!nombre || nombre.length > 255) {
        this.errorVenta.set(
          'Ingresa un cliente válido de hasta 255 caracteres.'
        );
        return;
      }

      if (this.carrito().length === 0) {
        this.errorVenta.set(
          'Agrega al menos un producto al carrito.'
        );
        return;
      }

      solicitud = {
        idempotencia: crypto.randomUUID(),
        cliente: nombre,
        medio: this.medio,
        items: this.carrito().map(linea => ({
          varianteId: linea.varianteId,
          cantidad: linea.cantidad
        }))
      };

      this.intentoPendiente.set(solicitud);
    }

    this.enviando.set(true);
    this.errorVenta.set('');

    this.http.post<VentaPosRespuesta>(
      apiUrl('/api/ventas/pos'),
      solicitud
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: venta => {
          this.resultado.set(venta);

          this.intentoPendiente.set(null);
          this.carrito.set([]);

          this.enviando.set(false);
          this.cargarProductos();
        },
        error: error => {
          this.enviando.set(false);

          this.errorVenta.set(
            this.mensajeError(
              error,
              'No se pudo confirmar la venta.'
            )
          );

          // Importante:
          // NO generamos otro UUID.
          // Un nuevo intento usa la misma solicitud.
        }
      });
  }

  descartarIntento(): void {
    if (this.enviando() || !this.intentoPendiente()) {
      return;
    }

    const confirmado = window.confirm(
      'No se ha confirmado si la venta fue registrada. ' +
      'Descartar este intento y realizar otro cobro ' +
      'podría duplicar una venta que sí se guardó. ' +
      'Verifica primero el registro de ventas. ' +
      '¿Deseas descartar el intento?'
    );

    if (!confirmado) {
      return;
    }

    this.intentoPendiente.set(null);
    this.errorVenta.set('');
    this.cargarProductos();
  }

  nuevaVenta(): void {
    if (this.enviando() || this.intentoPendiente()) {
      return;
    }

    this.resultado.set(null);
    this.carrito.set([]);
    this.cliente = '';
    this.medio = 'EFECTIVO';
    this.busqueda.set('');
    this.errorVenta.set('');

    this.cargarProductos();
  }

  private mensajeError(
    error: unknown,
    predeterminado: string
  ): string {

    if (!(error instanceof HttpErrorResponse)) {
      return predeterminado;
    }

    if (error.status === 0) {
      return 'No se pudo confirmar la respuesta del servidor. ' +
        'Reintenta la misma operación para evitar duplicados.';
    }

    if (error.status === 401) {
      return 'La sesión expiró. Inicia sesión nuevamente.';
    }

    if (error.status === 403) {
      return 'No tienes permiso de administrador.';
    }

    if (error.status === 409) {
      return 'Conflicto en la operación: comprueba el stock ' +
        'y que no se haya procesado previamente.';
    }

    if (error.status >= 500) {
      return 'El servidor no confirmó la venta. ' +
        'No crees otra operación: reintenta con la misma clave.';
    }

    const detalle = error.error?.detail;

    if (typeof detalle === 'string' && detalle.trim()) {
      return detalle;
    }

    return predeterminado;
  }
}
