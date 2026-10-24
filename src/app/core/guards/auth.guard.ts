import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from '../services/sesion.service';
export const authGuard:CanActivateFn=()=> inject(SesionService).token() ? true : inject(Router).createUrlTree(['/login']);
export const adminGuard:CanActivateFn=()=> inject(SesionService).usuario()?.rol==='ADMIN' ? true : inject(Router).createUrlTree(['/']);
