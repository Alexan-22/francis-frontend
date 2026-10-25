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

import { HttpClient } from '@angular/common/http';

import { RouterLink } from '@angular/router';

import { finalize } from 'rxjs';

import { apiUrl } from '../../core/config/api.config';

import { ApiService } from '../../core/services/api.service';

// =====================================================
// RESPUESTA DEL BACKEND
// =====================================================

interface RegistroRespuesta {
  id: number;
}

// =====================================================
// COMPONENTE DE REGISTRO
// =====================================================

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './registro.component.html'
})
export class RegistroComponent {

  private readonly fb = inject(FormBuilder);

  private readonly http = inject(HttpClient);

  private readonly api = inject(ApiService);

  // ===================================================
  // FORMULARIO
  // ===================================================

  readonly form = this.fb.nonNullable.group({

    nombres: [
      '',
      [
        Validators.required,
        Validators.maxLength(255)
      ]
    ],

    apellidos: [
      '',
      [
        Validators.required,
        Validators.maxLength(255)
      ]
    ],

    correo: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    contrasena: [
      '',
      [
        Validators.required,
        Validators.minLength(8)
      ]
    ],

    confirmacion: [
      '',
      [
        Validators.required
      ]
    ]

  });

  // ===================================================
  // ESTADOS
  // ===================================================

  readonly cargando = signal(false);

  readonly error = signal('');

  readonly mensaje = signal('');

  // ===================================================
  // REGISTRAR CLIENTE
  // ===================================================

  registrar(): void {

    // Evitar solicitudes duplicadas.
    if (this.cargando()) {
      return;
    }

    // Limpiar mensajes anteriores.
    this.error.set('');
    this.mensaje.set('');

    // Comprobar validaciones del formulario.
    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    // Obtener valores.
    const {
      nombres,
      apellidos,
      correo,
      contrasena,
      confirmacion
    } = this.form.getRawValue();

    // =================================================
    // NORMALIZAR DATOS DEL CLIENTE
    // =================================================

    const nombreCompleto = [
      nombres.trim(),
      apellidos.trim()
    ].filter(Boolean).join(' ');

    const email = correo.trim().toLowerCase();

    if (!nombres.trim() || !apellidos.trim()) {

      this.error.set(
        'Debes ingresar tus nombres y apellidos.'
      );

      return;
    }

    if (nombreCompleto.length > 255) {

      this.error.set(
        'El nombre completo no puede superar 255 caracteres.'
      );

      return;
    }

    // =================================================
    // VALIDAR CONTRASEÑAS
    // =================================================

    if (contrasena !== confirmacion) {

      this.error.set(
        'Las contraseñas no coinciden.'
      );

      return;
    }

    const longitudBytes = new TextEncoder()
      .encode(contrasena)
      .length;

    if (longitudBytes > 72) {

      this.error.set(
        'La contraseña no puede superar 72 bytes UTF-8.'
      );

      return;
    }

    // =================================================
    // PREPARAR SOLICITUD PARA SPRING BOOT
    // =================================================

    const datosRegistro = {
      email,
      nombre: nombreCompleto,
      password: contrasena
    };

    // =================================================
    // ENVIAR REGISTRO
    // =================================================

    this.cargando.set(true);

    this.http.post<RegistroRespuesta>(
      apiUrl('/api/auth/registro'),
      datosRegistro
    ).pipe(

      finalize(() => {

        this.cargando.set(false);

      })

    ).subscribe({

      // ===============================================
      // REGISTRO CORRECTO
      // ===============================================

      next: () => {

        this.mensaje.set(
          'Tu cuenta fue registrada correctamente. ' +
          'Ahora puedes iniciar sesión.'
        );

        // Limpiar el formulario después del registro.
        this.form.reset();

      },

      // ===============================================
      // ERROR DEL SERVIDOR
      // ===============================================

      error: err => {

        this.error.set(
          this.api.error(err)
        );

      }

    });

  }

}