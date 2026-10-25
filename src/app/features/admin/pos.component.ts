
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal
} from '@angular/core';

import {
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';

import {
  Subscription
} from 'rxjs';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  ApiService
} from '../../core/services/api.service';

import {
  Producto
} from '../../core/models/models';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './pos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PosComponent {

  // =====================================================
  // SERVICIOS
  // =====================================================

  private readonly api = inject(ApiService);

  private readonly destroyRef = inject(DestroyRef);

  // =====================================================
  // FORMULARIO DE BÚSQUEDA
  // =====================================================

  readonly buscar = new FormControl('', {
    nonNullable: true
  });

  // =====================================================
  // ESTADO DEL COMPONENTE
  // =====================================================

  readonly productos = signal<Producto[]>([]);

  readonly error = signal('');

  readonly cargando = signal(false);

  // Consulta HTTP actualmente activa.
  private consultaActiva?: Subscription;

  // =====================================================
  // CONSULTAR PRODUCTOS
  // =====================================================

  consultar(): void {

    const termino = this.buscar.value.trim();

    // Cancelar una consulta anterior si sigue activa.
    this.consultaActiva?.unsubscribe();

    // Restablecer mensajes y activar la carga.
    this.error.set('');
    this.cargando.set(true);

    // Consultar el catálogo a través de ApiService.
    this.consultaActiva = this.api.productos(termino)
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: (productos: Producto[]) => {

          this.productos.set(productos);

          this.cargando.set(false);
        },

        error: (error: unknown) => {

          this.productos.set([]);

          this.error.set(
            this.api.error(error)
          );

          this.cargando.set(false);
        }
      });
  }
}
