import { Injectable, signal } from '@angular/core';
import { UsuarioSesion } from '../models/models';
@Injectable({providedIn:'root'})
export class SesionService {
 readonly token=signal<string|null>(null); // solo memoria, no localStorage
 readonly usuario=signal<UsuarioSesion|null>(null);
 establecer(token:string,usuario:UsuarioSesion){this.token.set(token);this.usuario.set(usuario);}
 cerrar(){this.token.set(null);this.usuario.set(null);}
}
