
import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

@Component({
  selector: 'app-clientes-presenciales',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './clientes-presenciales.html',
  styleUrl: './clientes-presenciales.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientesPresencialesComponent {

  // La gestión de clientes presenciales permanece
  // pendiente hasta confirmar los endpoints,
  // DTO y permisos reales de comercio-service.

}
