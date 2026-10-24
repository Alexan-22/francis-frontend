
import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

import { ApiService } from '../../../core/services/api.service';
import { Producto } from '../../../core/models/models';

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

  private readonly actualizar$ = new Subject<void>();

  readonly busqueda = new FormControl('', {
    nonNullable: true
  });

  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  private readonly moneda = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  });

  constructor() {

    merge(
      this.busqueda.valueChanges,

      this.actualizar$.pipe(
        map(() => this.busqueda.value)
      )
    )
      .pipe(
        startWith(this.busqueda.value),

        debounceTime(300),

        tap(() => {
          this.cargando.set(true);
          this.error.set('');
        }),

        switchMap(texto =>
          this.api.productos(texto, 0).pipe(
            catchError((err: unknown) => {
              this.error.set(this.api.error(err));
              return of([] as Producto[]);
            })
          )
        ),

        takeUntilDestroyed()
      )
      .subscribe(lista => {
        this.productos.set(lista);
        this.cargando.set(false);
      });
  }

  actualizar(): void {
    this.actualizar$.next();
  }

  limpiarBusqueda(): void {
    this.busqueda.setValue('');
    if (!this.busqueda.value) {
      this.actualizar();
    }
  }

  formatearPrecio(precio: number): string {
    return this.moneda.format(precio);
  }

  obtenerStock(producto: Producto): number | null {

    if (!producto.tallas) {
      return null;
    }

    return producto.tallas.reduce(
      (total, talla) =>
        total + Math.max(0, talla.stockDisponible),
      0
    );
  }

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
