import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE } from '../config/api.config';
import { SesionService } from '../services/sesion.service';
export const tokenInterceptor: HttpInterceptorFn=(req,next)=>{
 const token=inject(SesionService).token();
 if(!token || !req.url.startsWith(`${API_BASE}/api/`)) return next(req);
 return next(req.clone({setHeaders:{Authorization:`Bearer ${token}`}}));
};
