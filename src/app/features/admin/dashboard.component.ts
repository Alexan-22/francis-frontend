import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type Periodo = 'semana' | 'mes' | 'trimestre';

interface BarraVenta {
  etiqueta: string;
  porcentaje: number;
}

interface ResumenDashboard {
  ventas: number;
  pedidos: number;
  productos: number;
  stockBajo: number;
  barras: BarraVenta[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  // Datos de demostración.
  // Posteriormente se conectarán al backend.
  readonly periodo = signal<Periodo>('semana');

  readonly datos: Record<Periodo, ResumenDashboard> = {
    semana: {
      ventas: 12850,
      pedidos: 128,
      productos: 64,
      stockBajo: 7,
      barras: [
        { etiqueta: 'Lun', porcentaje: 45 },
        { etiqueta: 'Mar', porcentaje: 65 },
        { etiqueta: 'Mié', porcentaje: 50 },
        { etiqueta: 'Jue', porcentaje: 80 },
        { etiqueta: 'Vie', porcentaje: 70 },
        { etiqueta: 'Sáb', porcentaje: 95 },
        { etiqueta: 'Dom', porcentaje: 60 }
      ]
    },
    mes: {
      ventas: 48900,
      pedidos: 420,
      productos: 64,
      stockBajo: 7,
      barras: [
        { etiqueta: 'S1', porcentaje: 40 },
        { etiqueta: 'S2', porcentaje: 65 },
        { etiqueta: 'S3', porcentaje: 80 },
        { etiqueta: 'S4', porcentaje: 100 }
      ]
    },
    trimestre: {
      ventas: 139800,
      pedidos: 1250,
      productos: 64,
      stockBajo: 7,
      barras: [
        { etiqueta: 'Mes 1', porcentaje: 55 },
        { etiqueta: 'Mes 2', porcentaje: 75 },
        { etiqueta: 'Mes 3', porcentaje: 95 }
      ]
    }
  };

  readonly resumen = computed(
    () => this.datos[this.periodo()]
  );

  readonly productosBajoStock = [
    { nombre: 'Blusa Elegance', stock: 2 },
    { nombre: 'Vestido Casual', stock: 3 },
    { nombre: 'Pantalón Classic', stock: 4 }
  ];

  cambiarPeriodo(periodo: Periodo): void {
    this.periodo.set(periodo);
  }

  moneda(valor: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor);
  }
}
