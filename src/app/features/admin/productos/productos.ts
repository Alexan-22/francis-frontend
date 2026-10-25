
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  Subject,
  merge,
  map,
  of,
  startWith,
  debounceTime,
  switchMap,
  catchError,
  tap
} from 'rxjs';

import {
  ApiService
} from '../../../core/services/api.service';

import {
  Producto
} from '../../../core/models/models';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductosComponent {

  // =====================================================
  // SERVICIOS
  // =====================================================

  private readonly api = inject(ApiService);

  // =====================================================
  // EVENTOS
  // =====================================================

  private readonly actualizar$ = new Subject<void>();

  // =====================================================
  // FORMULARIO DE BÚSQUEDA
  // =====================================================

  readonly busqueda = new FormControl('', {
    nonNullable: true
  });

  // =====================================================
  // ESTADO DEL COMPONENTE
  // =====================================================

  readonly productos = signal<Producto[]>([]);

  readonly cargando = signal(true);

  readonly error = signal('');

  // =====================================================
  // FORMATO DE MONEDA
  // =====================================================

  private readonly moneda = new Intl.NumberFormat(
    'es-PE',
    {
      style: 'currency',
      currency: 'PEN'
    }
  );

  // =====================================================
  // INICIALIZACIÓN
  // =====================================================

  constructor() {

    merge(

      // Búsqueda escrita por el administrador.
      this.busqueda.valueChanges.pipe(
        debounceTime(300)
      ),

      // Actualización manual sin esperar el debounce.
      this.actualizar$.pipe(
        map(() => this.busqueda.value)
      )

    )
      .pipe(

        // Consultar al abrir el componente.
        startWith(this.busqueda.value),

        // Eliminar espacios al comienzo y al final.
        map(texto => texto.trim()),

        // Iniciar estado de carga.
        tap(() => {

          this.cargando.set(true);

          this.error.set('');

        }),

        // Cancelar la consulta anterior y ejecutar
        // la búsqueda más reciente.
        switchMap(texto =>

          this.api.productos(texto, 0).pipe(

            catchError((err: unknown) => {

              this.error.set(
                this.api.error(err)
              );

              return of([] as Producto[]);

            })

          )

        ),

        // Cancelar al destruir el componente.
        takeUntilDestroyed()

      )
      .subscribe((lista: Producto[]) => {

        this.productos.set(lista);

        this.cargando.set(false);

      });

  }

  // =====================================================
  // ACTUALIZAR PRODUCTOS
  // =====================================================

  actualizar(): void {

    this.actualizar$.next();

  }

  // =====================================================
  // LIMPIAR BÚSQUEDA
  // =====================================================

  limpiarBusqueda(): void {

    // Si el campo ya está vacío, actualizar directamente.
    if (this.busqueda.value === '') {

      this.actualizar();

      return;
    }

    // setValue ya activa valueChanges.
    // No es necesario llamar también a actualizar().
    this.busqueda.setValue('');

  }

  // =====================================================
  // FORMATEAR PRECIO EN SOLES
  // =====================================================

  formatearPrecio(precio: number): string {

    if (!Number.isFinite(precio)) {
      return 'Precio no disponible';
    }

    return this.moneda.format(precio);

  }

  // =====================================================
  // CALCULAR STOCK CONOCIDO
  // =====================================================

  obtenerStock(producto: Producto): number | null {

    // Sin datos de tallas no podemos calcular existencias.
    if (!Array.isArray(producto.tallas)) {
      return null;
    }

    let total = 0;

    for (const talla of producto.tallas) {

      const disponible = talla.stockDisponible;

      // No mostrar totales basados en valores inválidos.
      if (
        !Number.isSafeInteger(disponible) ||
        disponible < 0
      ) {
        return null;
      }

      total += disponible;

      if (!Number.isSafeInteger(total)) {
        return null;
      }
    }

    return total;
  }

  // =====================================================
  // OBTENER ESTADO DEL PRODUCTO
  // =====================================================

  obtenerEstado(producto: Producto): string {

    if (producto.activo === true) {
      return 'Activo';
    }

    if (producto.activo === false) {
      return 'Inactivo';
    }

    return 'Sin confirmar';
  }
}
