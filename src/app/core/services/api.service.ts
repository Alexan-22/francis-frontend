import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, map, throwError, catchError } from 'rxjs';
import { apiUrl } from '../config/api.config';
import { Producto, ProblemDetail } from '../models/models';
@Injectable({providedIn:'root'})
export class ApiService {
 private http=inject(HttpClient);
 /** Solo rutas a través del Gateway, sin fallback a mocks. */
 productos(busqueda='',pagina=0):Observable<Producto[]> {
  let params = new HttpParams().set('page',pagina);
  if(busqueda.trim()) params=params.set('search',busqueda.trim());
  return this.http.get<unknown>(apiUrl('/api/productos'),{params}).pipe(map(data=> {
   if(Array.isArray(data)) return data as Producto[];
   if(data && typeof data==='object' && 'content' in data && Array.isArray(data.content)) return data.content as Producto[];
   throw new Error('Formato de catálogo no compatible. Verificar contrato de /api/productos.');
  }));
 }
 producto(id:number){return this.http.get<Producto>(apiUrl(`/api/productos/${id}`));}
 public error(e:unknown):string {
  if(e instanceof HttpErrorResponse){
   if(e.status===0) return 'No se pudo conectar con el API Gateway. Comprueba que esté iniciado en el puerto 8085.';
   const body=e.error as ProblemDetail|null;
   return body && typeof body==='object' && (body.detail||body.title) ? String(body.detail||body.title) : `La solicitud falló (${e.status}).`;
  }
  return e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
 }
}
