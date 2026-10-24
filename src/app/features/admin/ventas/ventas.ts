import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({standalone: true, imports: [RouterLink], templateUrl: './ventas.html', styleUrl: './ventas.css'})
export class VentasComponent { readonly url = '/api/ventas'; }
