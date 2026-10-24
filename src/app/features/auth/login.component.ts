import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { apiUrl } from '../../core/config/api.config';
import { ApiService } from '../../core/services/api.service';
import { SesionService } from '../../core/services/sesion.service';
import { UsuarioSesion } from '../../core/models/models';
interface LoginRespuesta { token?:string; accessToken?:string; usuario?:UsuarioSesion; rol?:'ADMIN'|'CLIENTE'; correo?:string; }
@Component({standalone:true,imports:[ReactiveFormsModule,RouterLink],templateUrl: 'login.component.html'})
export class LoginComponent {
 private fb=inject(FormBuilder);private http=inject(HttpClient);private sesion=inject(SesionService);private router=inject(Router);private api=inject(ApiService);
 formulario=this.fb.nonNullable.group({correo:['',[Validators.required,Validators.email]],clave:['',[Validators.required]]}); cargando=signal(false);error=signal('');
 ingresar(){if(this.formulario.invalid||this.cargando())return;this.error.set('');this.cargando.set(true);
 this.http.post<LoginRespuesta>(apiUrl('/api/auth/login'),this.formulario.getRawValue()).pipe(finalize(()=>this.cargando.set(false))).subscribe({next:respuesta=>{
 const token=respuesta.accessToken||respuesta.token;const u=respuesta.usuario || (respuesta.rol&&respuesta.correo?{rol:respuesta.rol,correo:respuesta.correo}:null);
 if(!token||!u){this.error.set('La respuesta de autenticación no coincide con el contrato esperado. Revisa docs/backend-contract-gaps.md.');return;}
 this.sesion.establecer(token,u);void this.router.navigateByUrl(u.rol==='ADMIN'?'/admin':'/mis-compras');
 },error:e=>this.error.set(this.api.error(e))});}
}
