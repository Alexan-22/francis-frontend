
export interface Producto {
  idProducto: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  precioOferta?: number | null;
  imagenPrincipal?: string;
  activo?: boolean;
  tallas?: ProductoTalla[];
}

export interface ProductoTalla {
  idProductoTalla: number;
  talla: string;
  stockDisponible: number;
}

export interface CarritoItem {
  idProductoTalla: number;
  idProducto: number;
  nombre: string;
  talla: string;
  cantidad: number;
  precioReferencia: number;
  imagen?: string;
}

export type RolUsuario = 'ADMIN' | 'CLIENTE';

export interface UsuarioSesion {
  correo: string;
  rol: RolUsuario;
}

export interface ProblemDetail {
  title?: string;
  detail?: string;
  status?: number;
  instance?: string;
}
