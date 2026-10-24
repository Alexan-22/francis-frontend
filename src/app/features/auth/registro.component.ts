import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { apiUrl } from '../../core/config/api.config';
import { ApiService } from '../../core/services/api.service';
@Component({standalone:true,imports:[ReactiveFormsModule,RouterLink],templateUrl: 'registro.component.html'})
export class RegistroComponent {
 private fb=inject(FormBuilder);private http=inject(HttpClient);private api=inject(ApiService);
 form=this.fb.nonNullable.group({nombres:['',Validators.required],apellidos:['',Validators.required],correo:['',[Validators.required,Validators.email]],contrasena:['',[Validators.required,Validators.minLength(8)]],confirmacion:['',Validators.required]});cargando=signal(false);error=signal('');mensaje=signal('');
 registrar(){if(this.form.invalid||this.cargando())return;const {confirmacion,...body}=this.form.getRawValue();if(body.contrasena!==confirmacion){this.error.set('Las contraseñas no coinciden.');return;}if(new TextEncoder().encode(body.contrasena).length>72){this.error.set('La contraseña supera 72 bytes UTF-8.');return;}this.cargando.set(true);this.error.set('');this.http.post(apiUrl('/api/auth/registro'),body).pipe(finalize(()=>this.cargando.set(false))).subscribe({next:()=>this.mensaje.set('Solicitud de registro aceptada. Ahora puedes iniciar sesión.'),error:e=>this.error.set(this.api.error(e))});}
}
