
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

  private readonly api = inject(ApiService);

  // ===================================================
  // ESTADO
  // ===================================================

  readonly productos = signal<Producto[]>([]);

  readonly cargando = signal(true);

  readonly error = signal('');

  readonly busqueda = new FormControl('', {
    nonNullable: true
  });

  private readonly actualizar$ = new Subject<void>();

  private readonly moneda = new Intl.NumberFormat(
    'es-PE',
    {
      style: 'currency',
      currency: 'PEN'
    }
  );

  // ===================================================
  // CONSULTAR PRODUCTOS
  // ===================================================

  constructor() {

    merge(

      this.busqueda.valueChanges.pipe(
        debounceTime(300)
      ),

      this.actualizar$.pipe(
        map(() => this.busqueda.value)
      )

    ).pipe(

      startWith(this.busqueda.value),

      map(texto => texto.trim()),

      tap(() => {
        this.cargando.set(true);
        this.error.set('');
      }),

      switchMap(texto =>

        this.api.productos(texto).pipe(

          catchError((err: unknown) => {

            this.error.set(
              this.api.error(err)
            );

            return of([] as Producto[]);
          })

        )

      ),

      takeUntilDestroyed()

    ).subscribe(lista => {

      this.productos.set(lista);

      this.cargando.set(false);

    });
  }

  // ===================================================
  // ACTUALIZAR
  // ===================================================

  actualizar(): void {

    if (this.cargando()) {
      return;
    }

    this.actualizar$.next();
  }

  // ===================================================
  // LIMPIAR BUSCADOR
  // ===================================================

  limpiarBusqueda(): void {

    if (this.busqueda.value === '') {
      this.actualizar();
      return;
    }

    this.busqueda.setValue('');
  }

  // ===================================================
  // PRECIO
  // ===================================================

  formatearPrecio(precio: number): string {

    if (!Number.isFinite(precio)) {
      return 'Precio no disponible';
    }

    return this.moneda.format(precio);
  }

  // ===================================================
  // STOCK
  // ===================================================

  obtenerStock(producto: Producto): number | null {

    // El endpoint actual no proporciona las tallas.
    if (!Array.isArray(producto.tallas)) {
      return null;
    }

    let total = 0;

    for (const variante of producto.tallas) {

      const stock = variante.stockDisponible;

      if (
        !Number.isSafeInteger(stock) ||
        stock < 0
      ) {
        return null;
      }

      total += stock;

      if (!Number.isSafeInteger(total)) {
        return null;
      }
    }

    return total;
  }

  // ===================================================
  // ESTADO
  // ===================================================

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
