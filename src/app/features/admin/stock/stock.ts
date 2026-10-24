import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({standalone: true, imports: [RouterLink], templateUrl: './stock.html', styleUrl: './stock.css'})
export class StockComponent { readonly url = '/api/productos'; }
