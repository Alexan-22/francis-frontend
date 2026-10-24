import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CarritoService } from '../core/services/carrito.service';
import { SesionService } from '../core/services/sesion.service';
@Component({standalone:true,imports:[RouterLink,RouterOutlet],templateUrl: 'public-layout.component.html'})
export class PublicLayoutComponent {carrito=inject(CarritoService);sesion=inject(SesionService);menu=signal(false);}
