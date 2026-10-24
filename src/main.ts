import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { tokenInterceptor } from './app/core/interceptors/token.interceptor';
bootstrapApplication(AppComponent,{providers:[provideRouter(routes,withInMemoryScrolling({scrollPositionRestoration:'enabled'})),provideHttpClient(withInterceptors([tokenInterceptor]))]}).catch(err=>console.error('No se pudo iniciar la aplicación.',err));
