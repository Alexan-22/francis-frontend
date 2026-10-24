import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../core/services/api.service';
import { Producto } from '../../core/models/models';
@Component({standalone:true,imports:[ReactiveFormsModule,RouterLink],templateUrl: 'catalogo.component.html'})
export class CatalogoComponent {
 private api=inject(ApiService);private route=inject(ActivatedRoute); private router=inject(Router);
 private destroy=inject(DestroyRef);
 busqueda=new FormControl('',{nonNullable:true}); productos=signal<Producto[]>([]); cargando=signal(false);error=signal('');pagina=signal(0);
 private refrescar=signal(0);
 constructor(){
  this.route.queryParamMap.pipe(tap(p=>{const texto=p.get('q')||'';if(this.busqueda.value!==texto)this.busqueda.setValue(texto,{emitEvent:false});this.pagina.set(Math.max(0,Number(p.get('page'))||0));}),takeUntilDestroyed()).subscribe();
  this.busqueda.valueChanges.pipe(debounceTime(350),distinctUntilChanged(),takeUntilDestroyed()).subscribe(q=>this.navegar(q,0));
  this.route.queryParamMap.pipe(tap(()=>{this.cargando.set(true);this.error.set('');}),switchMap(p=>this.api.productos(p.get('q')||'',Math.max(0,Number(p.get('page'))||0)).pipe(catchError(e=>{this.error.set(this.api.error(e));return of([] as Producto[]);}))),takeUntilDestroyed()).subscribe(items=>{this.productos.set(items);this.cargando.set(false);});
 }
 navegar(q:string,page:number){void this.router.navigate(['/tienda'],{queryParams:{q:q||null,page:page||null},queryParamsHandling:'merge'});}
 limpiar(){this.busqueda.setValue('');}
 paginaAnterior(){this.navegar(this.busqueda.value,this.pagina()-1)} paginaSiguiente(){this.navegar(this.busqueda.value,this.pagina()+1)}
 recargar(){void this.router.navigate(['/tienda'],{queryParams:{...this.route.snapshot.queryParams,revision:Date.now()}})}
 precio(n:number){return new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(n)}
}
