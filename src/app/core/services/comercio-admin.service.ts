
import { Injectable, inject } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  apiUrl
} from '../config/api.config';

// =====================================================
// DTO: PRODUCTOS
// =====================================================

export interface CrearProductoRequest {
  nombre: string;
  precio: number;
}

export interface ProductoCreado {
  id: number;
  nombre: string;
  precio: number;
  precioOferta: number | null;
}

// =====================================================
// DTO: VARIANTES Y TALLAS
// =====================================================

export interface CrearVarianteRequest {
  productoId: number;
  talla: string;
  stock: number;
}

export interface VarianteCreada {
  id: number;
  productoId: number;
  talla: string;
  stock: number;
}

// =====================================================
// SERVICIO ADMINISTRATIVO
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class ComercioAdminService {

  private readonly http = inject(HttpClient);

  // ===================================================
  // CREAR PRODUCTO
  // POST /api/productos
  // ===================================================

  crearProducto(
    request: CrearProductoRequest
  ): Observable<ProductoCreado> {

    return this.http.post<ProductoCreado>(
      apiUrl('/api/productos'),
      request
    );

  }

  // ===================================================
  // CREAR VARIANTE CON STOCK INICIAL
  // POST /api/producto-tallas
  // ===================================================

  crearVariante(
    request: CrearVarianteRequest
  ): Observable<VarianteCreada> {

    return this.http.post<VarianteCreada>(
      apiUrl('/api/producto-tallas'),
      request
    );

  }
}
