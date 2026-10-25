import { Injectable, inject } from '@angular/core';

import {
  HttpClient,
  HttpErrorResponse,
  HttpParams
} from '@angular/common/http';

import {
  Observable,
  map
} from 'rxjs';

import { apiUrl } from '../config/api.config';

import {
  Producto,
  ProblemDetail
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly http = inject(HttpClient);

  /**
   * Obtiene el catálogo de productos.
   *
   * Permite respuestas:
   * - Producto[]
   * - { content: Producto[] }
   *
   * Todas las solicitudes utilizan API Gateway.
   */
  productos(
    busqueda: string = '',
    pagina: number = 0
  ): Observable<Producto[]> {

    let params = new HttpParams().set(
      'page',
      pagina
    );

    const texto = busqueda.trim();

    if (texto) {
      params = params.set('search', texto);
    }

    return this.http.get<unknown>(
      apiUrl('/api/productos'),
      { params }
    ).pipe(

      map(respuesta => {

        // Respuesta como arreglo
        if (Array.isArray(respuesta)) {
          return respuesta as Producto[];
        }

        // Respuesta paginada de Spring
        if (
          respuesta !== null &&
          typeof respuesta === 'object' &&
          'content' in respuesta &&
          Array.isArray(respuesta.content)
        ) {
          return respuesta.content as Producto[];
        }

        throw new Error(
          'El formato del catálogo no coincide con el contrato de /api/productos.'
        );

      })

    );
  }

  /**
   * Obtiene un producto por su identificador.
   */
  producto(id: number): Observable<Producto> {

    return this.http.get<Producto>(
      apiUrl(`/api/productos/${id}`)
    );
  }

  /**
   * Convierte los errores HTTP en mensajes
   * comprensibles para el usuario.
   */
  public error(error: unknown): string {

    if (error instanceof HttpErrorResponse) {

      // Gateway no disponible o problema de red/CORS
      if (error.status === 0) {
        return (
          'No se pudo conectar con el API Gateway. ' +
          'Comprueba que esté funcionando en el puerto 8085.'
        );
      }

      // Mensaje estructurado del backend
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

      // Errores HTTP sin detalle
      switch (error.status) {

        case 400:
          return 'Los datos enviados no son válidos.';

        case 401:
          return 'No se pudo autenticar la solicitud o la sesión no es válida.';

        case 403:
          return 'No tienes permisos para realizar esta acción.';

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