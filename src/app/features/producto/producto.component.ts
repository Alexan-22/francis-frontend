import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  EMPTY,
  catchError,
  distinctUntilChanged,
  map,
  switchMap
} from 'rxjs';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import { ApiService } from '../../core/services/api.service';

import { CarritoService } from '../../core/services/carrito.service';

import {
  Producto,
  ProductoTalla
} from '../../core/models/models';

@Component({
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './producto.component.html'
})
export class ProductoComponent {

  private readonly api = inject(ApiService);

  private readonly route = inject(ActivatedRoute);

  private readonly carrito = inject(CarritoService);

  // ===================================================
  // ESTADO DEL PRODUCTO
  // ===================================================

  readonly producto = signal<Producto | null>(null);

  readonly talla = signal<ProductoTalla | null>(null);

  readonly cantidad = signal(1);

  readonly error = signal('');

  readonly mensaje = signal('');

  readonly cargando = signal(true);

  // ===================================================
  // INICIALIZACIÓN
  // ===================================================

  constructor() {

    this.route.paramMap.pipe(

      map(parametros => parametros.get('id')),

      distinctUntilChanged(),

      switchMap(valor => {

        // Limpiar estado anterior.
        this.producto.set(null);
        this.talla.set(null);
        this.cantidad.set(1);
        this.error.set('');
        this.mensaje.set('');
        this.cargando.set(true);

        const id = Number(valor);

        // Validar identificador.
        if (
          valor === null ||
          !Number.isSafeInteger(id) ||
          id < 1
        ) {

          this.error.set(
            'El identificador del producto no es válido.'
          );

          this.cargando.set(false);

          return EMPTY;
        }

        // Consultar producto a través del Gateway.
        return this.api.producto(id).pipe(

          catchError(err => {

            this.error.set(
              this.api.error(err)
            );

            this.cargando.set(false);

            return EMPTY;
          })

        );

      }),

      takeUntilDestroyed()

    ).subscribe(producto => {

      this.producto.set(producto);

      this.cargando.set(false);

    });

  }

  // ===================================================
  // ACTUALIZAR CANTIDAD
  // ===================================================

  actualizarCantidad(evento: Event): void {

    const input = evento.target as HTMLInputElement;

    const valor = Number(input.value);

    if (
      !Number.isSafeInteger(valor) ||
      valor < 1 ||
      valor > 99
    ) {

      this.cantidad.set(0);

      return;
    }

    this.cantidad.set(valor);

    // Limpiar mensajes al modificar la cantidad.
    this.mensaje.set('');
  }

  // ===================================================
  // AGREGAR PRODUCTO AL CARRITO
  // ===================================================

  agregar(producto: Producto): void {

    this.error.set('');
    this.mensaje.set('');

    const actual = this.producto();

    const tallaSeleccionada = this.talla();

    const unidades = this.cantidad();

    // Comprobar que exista el producto.
    if (
      !actual ||
      actual.idProducto !== producto.idProducto
    ) {

      this.mensaje.set(
        'No se pudo identificar el producto.'
      );

      return;
    }

    // Evitar productos inactivos.
    if (producto.activo === false) {

      this.mensaje.set(
        'Este producto no está disponible.'
      );

      return;
    }

    // Comprobar selección de talla.
    if (!tallaSeleccionada) {

      this.mensaje.set(
        'Selecciona una talla.'
      );

      return;
    }

    // Comprobar que la talla pertenece al producto.
    if (
      producto.tallas &&
      !producto.tallas.some(
        item =>
          item.idProductoTalla ===
          tallaSeleccionada.idProductoTalla
      )
    ) {

      this.mensaje.set(
        'La talla seleccionada no pertenece al producto.'
      );

      return;
    }

    // Validar cantidad solicitada.
    if (
      !Number.isSafeInteger(unidades) ||
      unidades < 1 ||
      unidades > 99
    ) {

      this.mensaje.set(
        'Selecciona una cantidad entre 1 y 99.'
      );

      return;
    }

    // Validar precio.
    if (
      !Number.isFinite(producto.precio) ||
      producto.precio < 0
    ) {

      this.mensaje.set(
        'El precio del producto no es válido.'
      );

      return;
    }

    // Comprobar stock disponible.
    const stock = tallaSeleccionada.stockDisponible;

    if (
      !Number.isSafeInteger(stock) ||
      stock < 1
    ) {

      this.mensaje.set(
        'Esta talla no tiene stock disponible.'
      );

      return;
    }

    // Consultar unidades que ya existen en el carrito.
    const existente = this.carrito.items().find(
      item =>
        item.idProductoTalla ===
        tallaSeleccionada.idProductoTalla
    );

    const cantidadExistente = existente?.cantidad ?? 0;

    const cantidadTotal = cantidadExistente + unidades;

    // Evitar superar el máximo del carrito.
    if (cantidadTotal > 99) {

      this.mensaje.set(
        'El carrito permite hasta 99 unidades por talla.'
      );

      return;
    }

    // Evitar superar el stock conocido.
    if (cantidadTotal > stock) {

      this.mensaje.set(
        'La cantidad solicitada supera el stock disponible.'
      );

      return;
    }

    // =================================================
    // GUARDAR EN EL CARRITO
    // =================================================

    this.carrito.agregar({

      idProductoTalla:
        tallaSeleccionada.idProductoTalla,

      idProducto:
        producto.idProducto,

      nombre:
        producto.nombre,

      talla:
        tallaSeleccionada.talla,

      cantidad:
        unidades,

      precioReferencia:
        producto.precio,

      imagen:
        producto.imagenPrincipal

    });

    this.mensaje.set(
      'Producto agregado al carrito.'
    );

  }

  // ===================================================
  // FORMATO DE PRECIOS
  // ===================================================

  precio(valor: number): string {

    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor);

  }

}