import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({standalone: true, imports: [RouterLink], templateUrl: './home-admin.html', styleUrl: './home-admin.css'})
export class HomeAdminComponent { readonly url = '/api/home'; }
