import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  finalize,
  map,
  switchMap,
  throwError
} from 'rxjs';

import { apiUrl } from '../../core/config/api.config';
import { ApiService } from '../../core/services/api.service';
import { SesionService } from '../../core/services/sesion.service';

import {
  UsuarioSesion
} from '../../core/models/models';

// =====================================================
// RESPUESTA DEL BACKEND: LOGIN
// =====================================================

interface LoginRespuesta {
  token: string;
  tipo: string;
  expiraEnSegundos: number;
}

// =====================================================
// RESPUESTA DEL BACKEND: PERFIL
// =====================================================

interface PerfilRespuesta {
  id?: number;
  email?: string;
  correo?: string;
  nombre?: string;
  rol: 'ADMIN' | 'CLIENTE';
  activo?: boolean;
}

// =====================================================
// COMPONENTE LOGIN
// =====================================================

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);

  // ===================================================
  // FORMULARIO
  // ===================================================

  readonly formulario = this.fb.nonNullable.group({

    correo: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    clave: [
      '',
      [
        Validators.required
      ]
    ]

  });

  // ===================================================
  // ESTADO DEL COMPONENTE
  // ===================================================

  readonly cargando = signal(false);

  readonly error = signal('');

  // ===================================================
  // INICIAR SESIÓN
  // ===================================================

  ingresar(): void {

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    if (this.cargando()) {
      return;
    }

    this.error.set('');
    this.cargando.set(true);

    const { correo, clave } =
      this.formulario.getRawValue();

    // Spring Boot espera email y password.
    const datosLogin = {
      email: correo.trim(),
      password: clave
    };

    // =================================================
    // PASO 1: AUTENTICAR
    // =================================================

    this.http.post<LoginRespuesta>(
      apiUrl('/api/auth/login'),
      datosLogin
    ).pipe(

      // ===============================================
      // PASO 2: OBTENER PERFIL CON EL JWT RECIBIDO
      // ===============================================

      switchMap(respuesta => {

        if (
          !respuesta.token ||
          typeof respuesta.token !== 'string'
        ) {
          return throwError(() =>
            new Error(
              'El servidor no devolvió un token válido.'
            )
          );
        }

        const headers = new HttpHeaders({
          Authorization: `Bearer ${respuesta.token}`
        });

        return this.http.get<PerfilRespuesta>(
          apiUrl('/api/usuarios/me'),
          { headers }
        ).pipe(

          map(perfil => ({
            token: respuesta.token,
            perfil
          }))

        );

      }),

      // ===============================================
      // FINALIZAR ESTADO DE CARGA
      // ===============================================

      finalize(() => {
        this.cargando.set(false);
      })

    ).subscribe({

      // ===============================================
      // LOGIN CORRECTO
      // ===============================================

      next: ({ token, perfil }) => {

        if (
          perfil?.rol !== 'ADMIN' &&
          perfil?.rol !== 'CLIENTE'
        ) {
          this.error.set(
            'El servidor devolvió un rol no válido.'
          );
          return;
        }

        const usuario: UsuarioSesion = {
          correo:
            perfil.correo ??
            perfil.email ??
            correo.trim(),

          rol: perfil.rol
        };

        // Guardar sesión solamente después
        // de obtener correctamente el perfil.
        this.sesion.establecer(
          token,
          usuario
        );

        // Redirigir según el rol.
        const destino =
          usuario.rol === 'ADMIN'
            ? '/admin'
            : '/mis-compras';

        void this.router.navigateByUrl(destino);
      },

      // ===============================================
      // ERROR DE AUTENTICACIÓN
      // ===============================================

      error: err => {
        this.error.set(
          this.api.error(err)
        );
      }

    });
  }
}