
import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuariosComponent {

  // =====================================================
  // ADMINISTRACIÓN DE USUARIOS
  // =====================================================

  // La gestión de cuentas se integrará después
  // de verificar los endpoints administrativos
  // y los DTO reales de auth-service.
  //
  // No se realizan cambios sobre usuarios,
  // contraseñas, estados ni roles desde
  // este componente provisional.

}
