import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  ParamMap,
  Router,
  RouterLink
} from '@angular/router';

import {
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';

import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
  tap
} from 'rxjs';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import { ApiService } from '../../core/services/api.service';
import { Producto } from '../../core/models/models';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './catalogo.component.html'
})
export class CatalogoComponent {

  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // ===================================================
  // FORMULARIO DE BÚSQUEDA
  // ===================================================

  readonly busqueda = new FormControl('', {
    nonNullable: true
  });

  // ===================================================
  // ESTADO DEL CATÁLOGO
  // ===================================================

  readonly productos = signal<Producto[]>([]);

  readonly cargando = signal(false);

  readonly error = signal('');

  readonly pagina = signal(0);

  // ===================================================
  // INICIALIZACIÓN
  // ===================================================

  constructor() {

    // Escuchar cambios de búsqueda.
    this.busqueda.valueChanges.pipe(

      debounceTime(350),

      distinctUntilChanged(),

      takeUntilDestroyed()

    ).subscribe(texto => {

      this.navegar(texto, 0);

    });

    // Escuchar cambios en la URL y consultar productos.
    this.route.queryParamMap.pipe(

      tap(parametros => {

        const texto = parametros.get('q') ?? '';

        if (this.busqueda.value !== texto) {

          this.busqueda.setValue(texto, {
            emitEvent: false
          });

        }

        this.pagina.set(
          this.obtenerPagina(parametros)
        );

        this.cargando.set(true);
        this.error.set('');

      }),

      switchMap(parametros => {

        const texto = parametros.get('q') ?? '';

        const numeroPagina =
          this.obtenerPagina(parametros);

        return this.api.productos(
          texto,
          numeroPagina
        ).pipe(

          catchError(error => {

            this.error.set(
              this.api.error(error)
            );

            return of([] as Producto[]);

          })

        );

      }),

      takeUntilDestroyed()

    ).subscribe(productos => {

      this.productos.set(productos);

      this.cargando.set(false);

    });

  }

  // ===================================================
  // VALIDAR NÚMERO DE PÁGINA
  // ===================================================

  private obtenerPagina(
    parametros: ParamMap
  ): number {

    const valor = parametros.get('page');

    if (valor === null) {
      return 0;
    }

    const numero = Number(valor);

    if (
      !Number.isSafeInteger(numero) ||
      numero < 0
    ) {
      return 0;
    }

    return numero;
  }

  // ===================================================
  // NAVEGACIÓN
  // ===================================================

  navegar(
    texto: string,
    numeroPagina: number
  ): void {

    const busqueda = texto.trim();

    const paginaValida =
      Number.isSafeInteger(numeroPagina) &&
      numeroPagina >= 0
        ? numeroPagina
        : 0;

    void this.router.navigate(['/tienda'], {

      queryParams: {

        q: busqueda || null,

        page: paginaValida > 0
          ? paginaValida
          : null,

        // Quitar el parámetro temporal de recarga.
        revision: null

      },

      // Conservar otros filtros de la URL.
      queryParamsHandling: 'merge'

    });
  }

  // ===================================================
  // LIMPIAR BÚSQUEDA
  // ===================================================

  limpiar(): void {

    this.busqueda.setValue('');

    // Si ya estaba vacía, también reiniciar página.
    if (!this.busqueda.valueChanges) {
      this.navegar('', 0);
    }
  }

  // ===================================================
  // PAGINACIÓN
  // ===================================================

  paginaAnterior(): void {

    if (this.pagina() <= 0) {
      return;
    }

    this.navegar(
      this.busqueda.value,
      this.pagina() - 1
    );
  }

  paginaSiguiente(): void {

    this.navegar(
      this.busqueda.value,
      this.pagina() + 1
    );
  }

  // ===================================================
  // VOLVER A CONSULTAR PRODUCTOS
  // ===================================================

  recargar(): void {

    void this.router.navigate(['/tienda'], {

      queryParams: {

        ...this.route.snapshot.queryParams,

        revision: Date.now()

      }

    });
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