
import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';

import { RouterLink } from '@angular/router';

interface Indicador {
  titulo: string;
  valor: string;
  descripcion: string;
  icono: string;
}

interface AccesoRapido {
  numero: string;
  titulo: string;
  descripcion: string;
  ruta: string;
  icono: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {

  readonly indicadores: Indicador[] = [
    {
      titulo: 'Productos',
      valor: '—',
      descripcion: 'Total del catálogo',
      icono: 'box'
    },
    {
      titulo: 'Ventas',
      valor: '—',
      descripcion: 'Ventas registradas',
      icono: 'receipt'
    },
    {
      titulo: 'Usuarios',
      valor: '—',
      descripcion: 'Clientes registrados',
      icono: 'users'
    },
    {
      titulo: 'Stock',
      valor: '—',
      descripcion: 'Unidades disponibles',
      icono: 'layers'
    }
  ];

  readonly accesos: AccesoRapido[] = [
    {
      numero: '01',
      titulo: 'Productos',
      descripcion: 'Administrar catálogo',
      ruta: '/admin/productos',
      icono: 'box'
    },
    {
      numero: '02',
      titulo: 'Inventario',
      descripcion: 'Consultar stock y tallas',
      ruta: '/admin/stock',
      icono: 'layers'
    },
    {
      numero: '03',
      titulo: 'Punto de venta',
      descripcion: 'Registrar ventas presenciales',
      ruta: '/admin/vender',
      icono: 'shopping'
    },
    {
      numero: '04',
      titulo: 'Ventas',
      descripcion: 'Revisar pedidos',
      ruta: '/admin/ventas',
      icono: 'receipt'
    },
    {
      numero: '05',
      titulo: 'Contenido',
      descripcion: 'Banners y colecciones',
      ruta: '/admin/home-admin',
      icono: 'home'
    },
    {
      numero: '06',
      titulo: 'Reportes',
      descripcion: 'Consultar indicadores',
      ruta: '/admin/reportes',
      icono: 'chart'
    }
  ];
}
