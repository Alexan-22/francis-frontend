
import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

import {
  Observable,
  map
} from 'rxjs';

import { apiUrl } from '../config/api.config';

import {
  Producto,
  ProductoTalla,
  ProblemDetail
} from '../models/models';

// =====================================================
// RESPUESTAS REALES DE COMERCIO SERVICE
// =====================================================

interface TallaApi {
  idProductoTalla: number;
  talla: string;
  stockDisponible: number;
}

interface ProductoApi {
  id: number;
  nombre: string;
  precio: number;
  precioOferta?: number | null;
  tallas?: TallaApi[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly http = inject(HttpClient);

  // ===================================================
  // NORMALIZAR TALLA
  // ===================================================

  private convertirTalla(
    valor: unknown
  ): ProductoTalla {

    if (
      valor === null ||
      typeof valor !== 'object'
    ) {
      throw new Error(
        'El backend devolvió una talla inválida.'
      );
    }

    const dato = valor as Partial<TallaApi>;

    if (
      typeof dato.idProductoTalla !== 'number' ||
      !Number.isSafeInteger(dato.idProductoTalla) ||
      dato.idProductoTalla <= 0 ||
      typeof dato.talla !== 'string' ||
      typeof dato.stockDisponible !== 'number' ||
      !Number.isSafeInteger(dato.stockDisponible) ||
      dato.stockDisponible < 0
    ) {
      throw new Error(
        'Los datos de stock no coinciden con el backend.'
      );
    }

    return {
      idProductoTalla: dato.idProductoTalla,
      talla: dato.talla,
      stockDisponible: dato.stockDisponible
    };
  }

  // ===================================================
  // NORMALIZAR PRODUCTO
  // ===================================================

  private convertirProducto(
    valor: unknown
  ): Producto {

    if (
      valor === null ||
      typeof valor !== 'object'
    ) {
      throw new Error(
        'El backend devolvió un producto inválido.'
      );
    }

    const dato = valor as Partial<ProductoApi>;

    if (
      typeof dato.id !== 'number' ||
      !Number.isSafeInteger(dato.id) ||
      dato.id <= 0 ||
      typeof dato.nombre !== 'string' ||
      typeof dato.precio !== 'number' ||
      !Number.isFinite(dato.precio)
    ) {
      throw new Error(
        'El contrato del catálogo no coincide con el backend.'
      );
    }

    if (
      dato.precioOferta != null &&
      (
        typeof dato.precioOferta !== 'number' ||
        !Number.isFinite(dato.precioOferta)
      )
    ) {
      throw new Error(
        'El precio de oferta recibido no es válido.'
      );
    }

    // Distinguir entre:
    // - []: el producto no tiene tallas.
    // - undefined: el backend no informó las tallas.

    const tallas = dato.tallas === undefined
      ? undefined
      : Array.isArray(dato.tallas)
        ? dato.tallas.map(
            talla => this.convertirTalla(talla)
          )
        : (() => {
            throw new Error(
              'El formato de las tallas no es válido.'
            );
          })();

    return {
      idProducto: dato.id,
      nombre: dato.nombre,
      precio: dato.precio,
      precioOferta: dato.precioOferta ?? null,
      tallas
    };
  }

  // ===================================================
  // OBTENER CATÁLOGO
  // ===================================================

  productos(
    busqueda: string = '',
    pagina: number = 0
  ): Observable<Producto[]> {

    // Pendiente: paginación real en el backend.
    void pagina;

    return this.http.get<unknown>(
      apiUrl('/api/productos')
    ).pipe(

      map(respuesta => {

        let registros: unknown[];

        if (Array.isArray(respuesta)) {

          registros = respuesta;

        } else if (
          respuesta !== null &&
          typeof respuesta === 'object' &&
          'content' in respuesta &&
          Array.isArray(respuesta.content)
        ) {

          registros = respuesta.content;

        } else {

          throw new Error(
            'El formato del catálogo no es válido.'
          );
        }

        const productos = registros.map(
          registro => this.convertirProducto(registro)
        );

        const texto = busqueda
          .trim()
          .toLocaleLowerCase('es-PE');

        if (!texto) {
          return productos;
        }

        return productos.filter(producto =>
          producto.nombre
            .toLocaleLowerCase('es-PE')
            .includes(texto)
        );

      })

    );
  }

  // ===================================================
  // CONSULTAR PRODUCTO
  // ===================================================

  producto(id: number): Observable<Producto> {

    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error(
        'El identificador del producto no es válido.'
      );
    }

    // Temporalmente buscar en el catálogo
    // hasta tener un endpoint GET por ID.

    return this.productos().pipe(

      map(productos => {

        const producto = productos.find(
          p => p.idProducto === id
        );

        if (!producto) {
          throw new Error(
            `No se encontró el producto con ID ${id}.`
          );
        }

        return producto;
      })

    );
  }

  // ===================================================
  // MENSAJES DE ERROR
  // ===================================================

  error(error: unknown): string {

    if (error instanceof HttpErrorResponse) {

      if (error.status === 0) {
        return (
          'No se pudo conectar con el API Gateway. ' +
          'Comprueba que esté funcionando en el puerto 8085.'
        );
      }

      const respuesta = error.error as ProblemDetail | null;

      if (
        respuesta !== null &&
        typeof respuesta === 'object'
      ) {

        const mensaje =
          respuesta.detail ||
          respuesta.title;

        if (mensaje) {
          return String(mensaje);
        }
      }

      switch (error.status) {

        case 400:
          return 'Los datos enviados no son válidos.';

        case 401:
          return 'La sesión no es válida o ha expirado.';

        case 403:
          return 'No tienes permisos para esta operación.';

        case 404:
          return 'El recurso solicitado no existe.';

        case 409:
          return 'Existe un conflicto con los datos enviados.';

        case 500:
          return 'Ocurrió un error interno en el servidor.';

        case 502:
        case 503:
        case 504:
          return 'El servicio no está disponible temporalmente.';

        default:
          return `La solicitud falló (HTTP ${error.status}).`;
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Ocurrió un error inesperado.';
  }
}

