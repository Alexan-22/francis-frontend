import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Producto } from '../../core/models/models';
@Component({standalone:true,imports:[ReactiveFormsModule],templateUrl: 'pos.component.html'})
export class PosComponent {private api=inject(ApiService);buscar=new FormControl('',{nonNullable:true});productos=signal<Producto[]>([]);error=signal('');cargando=signal(false);consultar(){this.cargando.set(true);this.error.set('');this.api.productos(this.buscar.value).subscribe({next:p=>{this.productos.set(p);this.cargando.set(false)},error:e=>{this.error.set(this.api.error(e));this.cargando.set(false)}})}}
