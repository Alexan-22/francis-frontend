
import {
  Component,
  inject
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  CarritoService
} from '../../core/services/carrito.service';

@Component({
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent {

  // Servicio compartido del carrito de compras.
  readonly carrito = inject(CarritoService);

}
