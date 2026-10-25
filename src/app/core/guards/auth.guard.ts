import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import { SesionService } from '../services/sesion.service';

/**
 * Permite el acceso únicamente a usuarios
 * que tienen un token de sesión.
 */
export const authGuard: CanActivateFn = () => {

  const sesion = inject(SesionService);
  const router = inject(Router);

  if (!sesion.token()) {
    return router.createUrlTree(['/login']);
  }

  return true;
};

/**
 * Permite el acceso únicamente
 * a usuarios con rol ADMIN.
 */
export const adminGuard: CanActivateFn = () => {

  const sesion = inject(SesionService);
  const router = inject(Router);

  // Primero comprobar autenticación
  if (!sesion.token()) {
    return router.createUrlTree(['/login']);
  }

  // Después comprobar el rol
  const usuario = sesion.usuario();

  if (usuario?.rol !== 'ADMIN') {
    return router.createUrlTree(['/']);
  }

  return true;
};