import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({standalone: true, imports: [RouterLink], templateUrl: './clientes-presenciales.html', styleUrl: './clientes-presenciales.css'})
export class ClientesPresencialesComponent { readonly url = '/api/clientes-presenciales'; }
