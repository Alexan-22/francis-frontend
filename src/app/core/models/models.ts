// =====================================================
// PRODUCTOS
// =====================================================

/**
 * Modelo de producto recibido desde comercio-service.
 *
 * Los nombres de las propiedades deben coincidir
 * con el DTO real que devuelve /api/productos.
 */
export interface Producto {
  idProducto: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagenPrincipal?: string;
  activo?: boolean;
  tallas?: ProductoTalla[];
}

/**
 * Variante de producto según su talla.
 */
export interface ProductoTalla {
  idProductoTalla: number;
  talla: string;
  stockDisponible: number;
}

// =====================================================
// CARRITO DE COMPRAS
// =====================================================

/**
 * Artículo agregado al carrito.
 *
 * precioReferencia es informativo.
 * El backend debe calcular y validar el precio final.
 */
export interface CarritoItem {
  idProductoTalla: number;
  idProducto: number;
  nombre: string;
  talla: string;
  cantidad: number;
  precioReferencia: number;
  imagen?: string;
}

// =====================================================
// AUTENTICACIÓN
// =====================================================

export type RolUsuario = 'ADMIN' | 'CLIENTE';

/**
 * Información del usuario autenticado.
 *
 * El JWT se almacena por separado en SesionService.
 */
export interface UsuarioSesion {
  correo: string;
  rol: RolUsuario;
}

// =====================================================
// ERRORES HTTP
// =====================================================

/**
 * Estructura habitual de errores Problem Details.
 */
export interface ProblemDetail {
  title?: string;
  detail?: string;
  status?: number;
  instance?: string;
}