
import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  inject,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  NavigationEnd
} from '@angular/router';

import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SesionService } from '../../core/services/sesion.service';

interface AdminLink {
  texto: string;
  ruta: string;
  icono: string;
}

interface AdminGrupo {
  titulo: string;
  items: AdminLink[];
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent {

  private readonly router = inject(Router);
  readonly sesion = inject(SesionService);

  @ViewChild('botonMenu')
  botonMenu?: ElementRef<HTMLButtonElement>;

  @ViewChild('botonCerrar')
  botonCerrar?: ElementRef<HTMLButtonElement>;

  @ViewChild('contenidoPrincipal')
  contenidoPrincipal?: ElementRef<HTMLElement>;

  readonly menuAbierto = signal(false);
  readonly tituloActual = signal('Dashboard');

  readonly grupos: AdminGrupo[] = [
    {
      titulo: 'GENERAL',
      items: [
        {
          texto: 'Dashboard',
          ruta: '/admin',
          icono: 'dashboard'
        }
      ]
    },
    {
      titulo: 'CONTENIDO',
      items: [
        {
          texto: 'Página principal',
          ruta: '/admin/home-admin',
          icono: 'home'
        }
      ]
    },
    {
      titulo: 'CATÁLOGO',
      items: [
        {
          texto: 'Productos',
          ruta: '/admin/productos',
          icono: 'box'
        },
        {
          texto: 'Nuevo producto',
          ruta: '/admin/producto-form',
          icono: 'plus'
        },
        {
          texto: 'Stock y tallas',
          ruta: '/admin/stock',
          icono: 'layers'
        }
      ]
    },
    {
      titulo: 'NEGOCIO',
      items: [
        {
          texto: 'Punto de venta',
          ruta: '/admin/vender',
          icono: 'shopping'
        },
        {
          texto: 'Ventas y pedidos',
          ruta: '/admin/ventas',
          icono: 'receipt'
        },
        {
          texto: 'Clientes presenciales',
          ruta: '/admin/clientes-presenciales',
          icono: 'users'
        }
      ]
    },
    {
      titulo: 'GESTIÓN',
      items: [
        {
          texto: 'Usuarios',
          ruta: '/admin/usuarios',
          icono: 'users'
        },
        {
          texto: 'Reportes',
          ruta: '/admin/reportes',
          icono: 'chart'
        }
      ]
    }
  ];

  constructor() {
    this.actualizarTitulo();

    this.router.events
      .pipe(
        filter(
          (evento): evento is NavigationEnd =>
            evento instanceof NavigationEnd
        ),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.actualizarTitulo();
        this.cerrarMenu(false);
        this.contenidoPrincipal?.nativeElement.focus();
      });
  }

  get correoAdministrador(): string {
    return this.sesion.usuario()?.correo ?? 'Administrador';
  }

  get inicialAdministrador(): string {
    return this.correoAdministrador.charAt(0).toUpperCase();
  }

  abrirMenu(): void {
    this.menuAbierto.set(true);

    queueMicrotask(() => {
      this.botonCerrar?.nativeElement.focus();
    });
  }

  cerrarMenu(devolverFoco = true): void {
    const estabaAbierto = this.menuAbierto();

    this.menuAbierto.set(false);

    if (devolverFoco && estabaAbierto) {
      this.botonMenu?.nativeElement.focus();
    }
  }

  @HostListener('document:keydown.escape')
  cerrarConEscape(): void {
    if (this.menuAbierto()) {
      this.cerrarMenu();
    }
  }

  cerrarSesion(): void {
    this.sesion.cerrar();
    void this.router.navigateByUrl('/login');
  }

  private actualizarTitulo(): void {
    const ruta = this.router.url.split('?')[0];

    const enlace = this.grupos
      .flatMap(grupo => grupo.items)
      .find(item => item.ruta === ruta);

    this.tituloActual.set(enlace?.texto ?? 'Administración');
  }
}
