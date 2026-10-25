
import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './home-admin.html',
  styleUrl: './home-admin.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeAdminComponent {

  // =====================================================
  // ADMINISTRACIÓN DE CONTENIDO
  // =====================================================

  // Los banners de la tienda se almacenan
  // en contenido-service.
  //
  // La administración se conectará cuando
  // verifiquemos los controladores, DTO
  // y permisos reales del backend.
  //
  // Este componente todavía no realiza
  // operaciones HTTP.

}
