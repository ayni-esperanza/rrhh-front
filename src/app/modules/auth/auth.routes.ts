import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RecoverPasswordPageComponent } from './pages/recover-password-page/recover-password-page.component';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'recuperar-password', component: RecoverPasswordPageComponent },
  { path: '', pathMatch: 'full', redirectTo: 'login' }
];