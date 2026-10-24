import { Injectable, computed, signal } from '@angular/core';
import { CarritoItem } from '../models/models';
const STORAGE_KEY='francis-carrito-v1';
function recuperar():CarritoItem[] {
 try {
  const data=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]') as unknown;
  if(!Array.isArray(data)) return [];
  return data.filter((x):x is CarritoItem => !!x && typeof x==='object' && Number.isSafeInteger(x.idProductoTalla) && x.idProductoTalla>0 && Number.isSafeInteger(x.idProducto) && x.idProducto>0 && typeof x.nombre==='string' && typeof x.talla==='string' && Number.isSafeInteger(x.cantidad) && x.cantidad>0 && x.cantidad<=99 && typeof x.precioReferencia==='number' && Number.isFinite(x.precioReferencia) && x.precioReferencia>=0);
 }catch {return []}
}
@Injectable({providedIn:'root'})
export class CarritoService {
 readonly items=signal<CarritoItem[]>(recuperar());
 readonly cantidad=computed(()=>this.items().reduce((s,x)=>s+x.cantidad,0));
 readonly subtotal=computed(()=>this.items().reduce((s,x)=>s+x.cantidad*x.precioReferencia,0));
 private guardar(data:CarritoItem[]){this.items.set(data); try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch{ /* Almacenamiento inaccesible: estado en memoria */ }}
 agregar(item:CarritoItem){const prev=this.items().find(i=>i.idProductoTalla===item.idProductoTalla); this.guardar(prev?this.items().map(i=>i.idProductoTalla===item.idProductoTalla?{...i,cantidad:Math.min(99,i.cantidad+item.cantidad)}:i):[...this.items(),item]);}
 cambiar(id:number,cantidad:number){if(!Number.isInteger(cantidad)||cantidad<1||cantidad>99)return; this.guardar(this.items().map(i=>i.idProductoTalla===id?{...i,cantidad}:i));}
 eliminar(id:number){this.guardar(this.items().filter(i=>i.idProductoTalla!==id));}
 vaciar(){this.guardar([]);}
}
