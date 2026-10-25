import { Routes } from '@angular/router';

import {
  authGuard,
  adminGuard
} from './core/guards/auth.guard';

export const routes: Routes = [

  // =====================================================
  // PANEL ADMINISTRATIVO
  // =====================================================

  {
    path: 'admin',

    canActivate: [authGuard, adminGuard],
    canActivateChild: [authGuard, adminGuard],

    loadComponent: () =>
      import('./features/admin/admin.component')
        .then(m => m.AdminComponent),

    children: [

      // Dashboard principal
      {
        path: '',
        pathMatch: 'full',
        title: 'Administración | Francis Collection',

        loadComponent: () =>
          import('./features/admin/dashboard.component')
            .then(m => m.DashboardComponent)
      },

      // Punto de venta (POS)
      {
        path: 'vender',
        title: 'Punto de venta | Francis Collection',

        loadComponent: () =>
          import('./features/admin/pos.component')
            .then(m => m.PosComponent)
      },

      // Administración de productos
      {
        path: 'productos',
        title: 'Productos | Francis Collection',

        loadComponent: () =>
          import('./features/admin/productos/productos')
            .then(m => m.ProductosComponent)
      },

      // Inventario y stock
      {
        path: 'stock',
        title: 'Inventario y stock | Francis Collection',

        loadComponent: () =>
          import('./features/admin/stock/stock')
            .then(m => m.StockComponent)
      },

      // Ventas y pedidos
      {
        path: 'ventas',
        title: 'Ventas y pedidos | Francis Collection',

        loadComponent: () =>
          import('./features/admin/ventas/ventas')
            .then(m => m.VentasComponent)
      },

      // Administración de usuarios
      {
        path: 'usuarios',
        title: 'Usuarios | Francis Collection',

        loadComponent: () =>
          import('./features/admin/usuarios/usuarios')
            .then(m => m.UsuariosComponent)
      },

      // Reportes administrativos
      {
        path: 'reportes',
        title: 'Reportes | Francis Collection',

        loadComponent: () =>
          import('./features/admin/reportes/reportes')
            .then(m => m.ReportesComponent)
      },

      // Banners y colecciones
      {
        path: 'home-admin',
        title: 'Banners y colecciones | Francis Collection',

        loadComponent: () =>
          import('./features/admin/home-admin/home-admin')
            .then(m => m.HomeAdminComponent)
      },

      // Formulario de productos
      {
        path: 'producto-form',
        title: 'Formulario de productos | Francis Collection',

        loadComponent: () =>
          import('./features/admin/producto-form/producto-form')
            .then(m => m.ProductoFormComponent)
      },

      // Clientes presenciales
      {
        path: 'clientes-presenciales',
        title: 'Clientes presenciales | Francis Collection',

        loadComponent: () =>
          import(
            './features/admin/clientes-presenciales/clientes-presenciales'
          ).then(m => m.ClientesPresencialesComponent)
      },

      // Ruta administrativa desconocida
      {
        path: '**',
        redirectTo: '/admin'
      }

    ]
  },

  // =====================================================
  // TIENDA PÚBLICA
  // =====================================================

  {
    path: '',

    loadComponent: () =>
      import('./layouts/public-layout.component')
        .then(m => m.PublicLayoutComponent),

    children: [

      // Página de inicio
      {
        path: '',
        pathMatch: 'full',
        title: 'Inicio | Francis Collection',

        loadComponent: () =>
          import('./features/home/home.component')
            .then(m => m.HomeComponent)
      },

      // Catálogo
      {
        path: 'tienda',
        title: 'Tienda | Francis Collection',

        loadComponent: () =>
          import('./features/catalogo/catalogo.component')
            .then(m => m.CatalogoComponent)
      },

      // Detalle de producto
      {
        path: 'producto/:id',
        title: 'Detalle de producto | Francis Collection',

        loadComponent: () =>
          import('./features/producto/producto.component')
            .then(m => m.ProductoComponent)
      },

      // Carrito de compras
      {
        path: 'carrito',
        title: 'Carrito de compras | Francis Collection',

        loadComponent: () =>
          import('./features/carrito/carrito.component')
            .then(m => m.CarritoComponent)
      },

      // Inicio de sesión
      {
        path: 'login',
        title: 'Iniciar sesión | Francis Collection',

        loadComponent: () =>
          import('./features/auth/login.component')
            .then(m => m.LoginComponent)
      },

      // Registro de clientes
      {
        path: 'registro',
        title: 'Registrarse | Francis Collection',

        loadComponent: () =>
          import('./features/auth/registro.component')
            .then(m => m.RegistroComponent)
      },

      // Checkout protegido
      {
        path: 'checkout',

        canActivate: [authGuard],

        title: 'Finalizar compra | Francis Collection',

        loadComponent: () =>
          import('./features/checkout/checkout.component')
            .then(m => m.CheckoutComponent)
      },

      // Historial de compras protegido
      {
        path: 'mis-compras',

        canActivate: [authGuard],

        title: 'Mis compras | Francis Collection',

        loadComponent: () =>
          import('./features/compras/compras.component')
            .then(m => m.ComprasComponent)
      },

      // Redirección temporal de detalle de compra
      {
        path: 'mis-compras/:id',
        pathMatch: 'full',
        redirectTo: '/mis-compras'
      },

      // Redirección temporal de compra exitosa
      {
        path: 'compra-exitosa',
        pathMatch: 'full',
        redirectTo: '/mis-compras'
      },

      // Página no encontrada
      {
        path: '**',
        title: 'Página no encontrada | Francis Collection',

        loadComponent: () =>
          import('./features/home/not-found.component')
            .then(m => m.NotFoundComponent)
      }

    ]
  }

];
