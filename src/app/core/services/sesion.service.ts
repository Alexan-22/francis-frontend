import {
  Injectable,
  signal
} from '@angular/core';

import { UsuarioSesion } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class SesionService {

  // Token JWT almacenado únicamente en memoria.
  readonly token = signal<string | null>(null);

  // Usuario autenticado.
  readonly usuario = signal<UsuarioSesion | null>(null);

  /**
   * Establece una sesión después
   * de autenticar al usuario.
   */
  establecer(
    token: string,
    usuario: UsuarioSesion
  ): void {

    this.token.set(token);
    this.usuario.set(usuario);
  }

  /**
   * Elimina los datos locales de sesión.
   */
  cerrar(): void {

    this.token.set(null);
    this.usuario.set(null);
  }
}