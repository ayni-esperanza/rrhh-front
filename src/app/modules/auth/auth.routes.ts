import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RecoverPasswordPageComponent } from './pages/recover-password-page/recover-password-page.component';
import { authGuard } from '../../core/guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'recuperar-password', component: RecoverPasswordPageComponent },
  { path: 'restablecer-password', loadComponent: () => import('./pages/reset-password-page/reset-password-page.component').then((m) => m.ResetPasswordPageComponent) },
  { path: 'cambiar-password', canActivate: [authGuard], loadComponent: () => import('./pages/change-password-page/change-password-page.component').then((m) => m.ChangePasswordPageComponent) },
  { path: '', pathMatch: 'full', redirectTo: 'login' }
];
