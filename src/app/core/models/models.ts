/** DTO de integración inicial: comprobar nombres y estructura contra controladores reales. */
export interface Producto { idProducto:number; nombre:string; descripcion?:string; precio:number; imagenPrincipal?:string; activo?:boolean; tallas?:ProductoTalla[]; }
export interface ProductoTalla { idProductoTalla:number; talla:string; stockDisponible:number; }
export interface CarritoItem { idProductoTalla:number; idProducto:number; nombre:string; talla:string; cantidad:number; precioReferencia:number; imagen?:string; }
export interface UsuarioSesion { correo:string; rol:'ADMIN'|'CLIENTE'; }
export interface ProblemDetail { title?:string; detail?:string; status?:number; instance?:string; }
