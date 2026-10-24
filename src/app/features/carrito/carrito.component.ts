import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../core/services/carrito.service';
@Component({standalone:true,imports:[RouterLink],templateUrl: 'carrito.component.html'})
export class CarritoComponent {
 carrito=inject(CarritoService);
 cantidad(id:number,e:Event){this.carrito.cambiar(id,Number((e.target as HTMLInputElement).value))}
 precio(n:number){return new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(n)}
}
