
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal
} from '@angular/core';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  RouterLink
} from '@angular/router';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  ApiService
} from '../../../core/services/api.service';

import {
  ComercioAdminService,
  ProductoCreado,
  VarianteCreada
} from '../../../core/services/comercio-admin.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './producto-form.html',
  styleUrl: './producto-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductoFormComponent {

  // =====================================================
  // SERVICIOS
  // =====================================================

  private readonly comercio = inject(
    ComercioAdminService
  );

  private readonly api = inject(ApiService);

  private readonly destroyRef = inject(DestroyRef);

  // =====================================================
  // FORMULARIO DEL PRODUCTO
  // =====================================================

  readonly productoForm = new FormGroup({

    nombre: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(200)
      ]
    }),

    precio: new FormControl<number | null>(
      null,
      [
        Validators.required,
        Validators.min(0.01)
      ]
    )

  });

  // =====================================================
  // FORMULARIO DE TALLAS
  // =====================================================

  readonly varianteForm = new FormGroup({

    talla: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(30)
      ]
    }),

    stock: new FormControl<number | null>(
      0,
      [
        Validators.required,
        Validators.min(0)
      ]
    )

  });

  // =====================================================
  // ESTADOS DEL COMPONENTE
  // =====================================================

  readonly guardandoProducto = signal(false);

  readonly guardandoVariante = signal(false);

  readonly errorProducto = signal('');

  readonly errorVariante = signal('');

  readonly mensajeVariante = signal('');

  readonly productoCreado = signal<ProductoCreado | null>(
    null
  );

  readonly variantesCreadas = signal<VarianteCreada[]>(
    []
  );

  // =====================================================
  // VALIDAR PRECIO
  // =====================================================

  private precioValido(
    precio: number | null
  ): precio is number {

    if (
      precio === null ||
      !Number.isFinite(precio) ||
      precio <= 0
    ) {
      return false;
    }

    // Aceptar importes positivos con un máximo
    // de dos decimales.
    return /^\d+(\.\d{1,2})?$/.test(
      String(precio)
    );
  }

  // =====================================================
  // REGISTRAR PRODUCTO
  // =====================================================

  guardarProducto(): void {

    if (
      this.guardandoProducto() ||
      this.productoCreado()
    ) {
      return;
    }

    this.errorProducto.set('');

    this.productoForm.markAllAsTouched();

    const nombre =
      this.productoForm.controls.nombre.value.trim();

    const precio =
      this.productoForm.controls.precio.value;

    if (
      this.productoForm.invalid ||
      nombre.length === 0 ||
      !this.precioValido(precio)
    ) {

      this.errorProducto.set(
        'Ingresa un nombre y un precio válido ' +
        'con hasta dos decimales.'
      );

      return;
    }

    this.guardandoProducto.set(true);

    this.comercio.crearProducto({
      nombre,
      precio
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: producto => {

          this.productoCreado.set(producto);

          this.variantesCreadas.set([]);

          this.guardandoProducto.set(false);

          this.errorProducto.set('');

        },

        error: error => {

          this.errorProducto.set(
            this.api.error(error)
          );

          this.guardandoProducto.set(false);

        }

      });

  }

  // =====================================================
  // REGISTRAR TALLA
  // =====================================================

  guardarVariante(): void {

    const producto = this.productoCreado();

    if (
      !producto ||
      this.guardandoVariante()
    ) {
      return;
    }

    this.errorVariante.set('');

    this.mensajeVariante.set('');

    this.varianteForm.markAllAsTouched();

    const talla =
      this.varianteForm.controls.talla.value.trim();

    const stock =
      this.varianteForm.controls.stock.value;

    if (
      this.varianteForm.invalid ||
      talla.length === 0 ||
      stock === null ||
      !Number.isSafeInteger(stock) ||
      stock < 0
    ) {

      this.errorVariante.set(
        'Ingresa una talla y una cantidad entera ' +
        'de stock igual o mayor que cero.'
      );

      return;
    }

    this.guardandoVariante.set(true);

    this.comercio.crearVariante({

      productoId: producto.id,

      talla,

      stock

    })
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: variante => {

          this.variantesCreadas.update(
            lista => [...lista, variante]
          );

          this.varianteForm.reset({
            talla: '',
            stock: 0
          });

          this.mensajeVariante.set(
            'Talla registrada correctamente.'
          );

          this.guardandoVariante.set(false);

        },

        error: error => {

          this.errorVariante.set(
            this.api.error(error)
          );

          this.guardandoVariante.set(false);

        }

      });

  }

  // =====================================================
  // INICIAR OTRO PRODUCTO
  // =====================================================

  nuevoProducto(): void {

    if (
      this.guardandoProducto() ||
      this.guardandoVariante()
    ) {
      return;
    }

    this.productoForm.reset({
      nombre: '',
      precio: null
    });

    this.varianteForm.reset({
      talla: '',
      stock: 0
    });

    this.productoCreado.set(null);

    this.variantesCreadas.set([]);

    this.errorProducto.set('');

    this.errorVariante.set('');

    this.mensajeVariante.set('');

  }
}

