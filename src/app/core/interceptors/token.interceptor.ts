import { inject } from '@angular/core';

import {
  HttpInterceptorFn
} from '@angular/common/http';

import { API_BASE } from '../config/api.config';

import { SesionService } from '../services/sesion.service';

/**
 * Interceptor de autenticación JWT.
 *
 * Agrega el token únicamente a las peticiones
 * destinadas a nuestra API.
 *
 * Respeta los encabezados Authorization existentes.
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {

  const sesion = inject(SesionService);

  // Verificar que la solicitud pertenezca a nuestra API.
  const esPeticionApi = req.url.startsWith(
    `${API_BASE}/api/`
  );

  if (!esPeticionApi) {
    return next(req);
  }

  // No modificar las credenciales de autenticación pública.
  const esAutenticacionPublica =
    req.url.split('?')[0] === `${API_BASE}/api/auth/login` ||
    req.url.split('?')[0] === `${API_BASE}/api/auth/registro`;

  if (esAutenticacionPublica) {
    return next(req);
  }

  // Respetar el token proporcionado explícitamente.
  if (req.headers.has('Authorization')) {
    return next(req);
  }

  const token = sesion.token();

  // Si no existe una sesión, continuar sin JWT.
  if (!token) {
    return next(req);
  }

  // Adjuntar el JWT a la petición protegida.
  const peticionAutenticada = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(peticionAutenticada);
};