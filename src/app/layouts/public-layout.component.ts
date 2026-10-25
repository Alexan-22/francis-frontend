import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  RouterLink,
  RouterOutlet
} from '@angular/router';

import { CarritoService } from '../core/services/carrito.service';
import { SesionService } from '../core/services/sesion.service';

@Component({
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet
  ],
  templateUrl: './public-layout.component.html'
})
export class PublicLayoutComponent {

  // Servicio del carrito de compras
  readonly carrito = inject(CarritoService);

  // Servicio de autenticación
  readonly sesion = inject(SesionService);

  // Estado del menú de navegación
  readonly menu = signal(false);
}