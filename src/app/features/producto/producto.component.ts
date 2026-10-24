import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CarritoService } from '../../core/services/carrito.service';
import { Producto, ProductoTalla } from '../../core/models/models';
@Component({standalone:true,imports:[RouterLink],templateUrl: 'producto.component.html'})
export class ProductoComponent {
 private api=inject(ApiService); private route=inject(ActivatedRoute);private carrito=inject(CarritoService);
 producto=signal<Producto|null>(null);talla=signal<ProductoTalla|null>(null);cantidad=signal(1);error=signal('');mensaje=signal('');cargando=signal(true);
 constructor(){const id=Number(this.route.snapshot.paramMap.get('id'));if(!Number.isInteger(id)||id<1){this.error.set('Identificador inválido.');this.cargando.set(false);} else this.api.producto(id).subscribe({next:p=>{this.producto.set(p);this.cargando.set(false)},error:e=>{this.error.set(this.api.error(e));this.cargando.set(false)}});}
 actualizarCantidad(e:Event){const value=Number((e.target as HTMLInputElement).value);this.cantidad.set(Number.isInteger(value)?value:0)}
 agregar(p:Producto){const t=this.talla();if(!t||this.cantidad()<1||this.cantidad()>t.stockDisponible)return;this.carrito.agregar({idProductoTalla:t.idProductoTalla,idProducto:p.idProducto,nombre:p.nombre,talla:t.talla,cantidad:this.cantidad(),precioReferencia:p.precio,imagen:p.imagenPrincipal});this.mensaje.set('Producto agregado al carrito.');}
 precio(n:number){return new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(n)}
}
