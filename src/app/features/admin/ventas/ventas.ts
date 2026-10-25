
import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VentasComponent {

  // La consulta y administración de ventas
  // se implementarán después de verificar
  // los controladores y DTO de comercio-service.

}
