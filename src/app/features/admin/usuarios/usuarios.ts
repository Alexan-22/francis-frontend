import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({standalone: true, imports: [RouterLink], templateUrl: './usuarios.html', styleUrl: './usuarios.css'})
export class UsuariosComponent { readonly url = '/api/usuarios'; }
