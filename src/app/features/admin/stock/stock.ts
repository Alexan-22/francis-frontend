import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import { RouterLink } from '@angular/router';

import {
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  Subject,
  catchError,
  of,
  startWith,
  switchMap,
  tap
} from 'rxjs';

import {
  ApiService
} from '../../../core/services/api.service';

import {
  Producto
} from '../../../core/models/models';

interface FilaInventario {
  clave: string;
  productoId: number;
  productoNombre: string;
  varianteId: number | null;
  talla: string;
  disponible: number | null;
}

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './stock.html',
  styleUrl: './stock.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockComponent {

  private readonly api = inject(ApiService);

  private readonly actualizar$ = new Subject<void>();

  // ============================================
  // ESTADO
  // ============================================

  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  readonly busqueda = new FormControl('', {
    nonNullable: true
  });

  private readonly textoBusqueda = signal('');

  // ============================================
  // CONSTRUIR FILAS POR TALLA
  // ============================================

  readonly filas = computed<FilaInventario[]>(() => {

    const resultado: FilaInventario[] = [];

    for (const producto of this.productos()) {

      // Diferenciar productos sin tallas de aquellos
      // cuyo backend no informó variantes.

      if (!producto.tallas?.length) {

        resultado.push({
          clave: `producto-${producto.idProducto}`,
          productoId: producto.idProducto,
          productoNombre: producto.nombre,
          varianteId: null,
          talla: producto.tallas === undefined
            ? 'No informado'
            : 'Sin tallas registradas',
          disponible: null
        });

        continue;
      }

      for (const variante of producto.tallas) {

        resultado.push({
          clave: `variante-${variante.idProductoTalla}`,
          productoId: producto.idProducto,
          productoNombre: producto.nombre,
          varianteId: variante.idProductoTalla,
          talla: variante.talla,
          disponible: variante.stockDisponible
        });
      }
    }

    return resultado;
  });

  // ============================================
  // BUSCADOR LOCAL
  // ============================================

  readonly filasFiltradas = computed(() => {

    const texto = this.textoBusqueda();

    if (!texto) {
      return this.filas();
    }

    return this.filas().filter(fila => {

      const contenido = [
        fila.productoNombre,
        String(fila.productoId),
        fila.talla,
        fila.varianteId === null
          ? ''
          : String(fila.varianteId)
      ]
        .join(' ')
        .toLocaleLowerCase('es-PE');

      return contenido.includes(texto);
    });
  });

  // ============================================
  // INDICADORES
  // ============================================

  readonly resumen = computed(() => {

    const productos = this.productos();
    const variantes = this.filas().filter(
      fila => fila.varianteId !== null
    );

    let totalDisponible = 0;
    let variantesBajas = 0;
    let variantesAgotadas = 0;

    for (const variante of variantes) {

      const stock = variante.disponible;

      if (stock === null) {
        continue;
      }

      totalDisponible += stock;

      if (stock === 0) {
        variantesAgotadas++;
      } else if (stock <= 5) {
        variantesBajas++;
      }
    }

    return {
      productos: productos.length,
      variantes: variantes.length,
      totalDisponible,
      variantesBajas,
      variantesAgotadas
    };
  });

  // ============================================
  // INICIALIZACIÓN
  // ============================================

  constructor() {

    // Buscar sin repetir solicitudes HTTP.
    this.busqueda.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(valor => {

        this.textoBusqueda.set(
          valor.trim().toLocaleLowerCase('es-PE')
        );

      });

    // Consultar inicialmente y cuando se actualice.
    this.actualizar$
      .pipe(

        startWith(undefined),

        tap(() => {
          this.cargando.set(true);
          this.error.set('');
        }),

        switchMap(() =>

          this.api.productos().pipe(

            catchError((err: unknown) => {

              this.error.set(
                this.api.error(err)
              );

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

  // ============================================
  // ACTUALIZAR
  // ============================================

  actualizar(): void {

    if (this.cargando()) {
      return;
    }

    this.actualizar$.next();
  }

  // ============================================
  // LIMPIAR BÚSQUEDA
  // ============================================

  limpiarBusqueda(): void {

    this.busqueda.setValue('');
  }

  // ============================================
  // ESTADO DEL STOCK
  // ============================================

  estadoStock(
    disponible: number | null
  ): 'sin-datos' | 'agotado' | 'bajo' | 'disponible' {

    if (disponible === null) {
      return 'sin-datos';
    }

    if (disponible === 0) {
      return 'agotado';
    }

    if (disponible <= 5) {
      return 'bajo';
    }

    return 'disponible';
  }

  etiquetaStock(
    disponible: number | null
  ): string {

    switch (this.estadoStock(disponible)) {

      case 'agotado':
        return 'Agotado';

      case 'bajo':
        return 'Stock bajo';

      case 'disponible':
        return 'Disponible';

      default:
        return 'Sin datos';
    }
  }
}

