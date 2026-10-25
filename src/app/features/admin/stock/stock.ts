
import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './stock.html',
  styleUrl: './stock.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockComponent {

  // La consulta y administración del inventario
  // se implementarán cuando se confirmen
  // los endpoints reales de comercio-service.

}
