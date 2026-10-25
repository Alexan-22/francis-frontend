
import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportesComponent {

  // =====================================================
  // REPORTES ADMINISTRATIVOS
  // =====================================================

  // Este módulo permanece como pantalla informativa
  // hasta verificar los endpoints reales para:
  //
  // - Ventas
  // - Caja
  // - Inventario
  // - Pagos
  // - Devoluciones
  //
  // No se muestran estadísticas simuladas.

}
