import { Routes } from '@angular/router';
import { authGuard, authMatchGuard } from './core/guards/auth.guard';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  {
    path: 'loading',
    loadComponent: () => import('./shared/components/loading-screen/loading-screen.component').then((m) => m.LoadingScreenComponent),
    title: 'Cargando - AYNI RR.HH.'
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then((m) => m.AUTH_ROUTES)
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        canMatch: [authMatchGuard],
        data: { permissions: ['dashboard:view'] },
        loadChildren: () => import('./modules/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES)
      },
      {
        path: 'colaboradores',
        canMatch: [authMatchGuard],
        data: { permissions: ['colaboradores:manage'] },
        loadChildren: () => import('./modules/colaboradores/colaboradores.routes').then((m) => m.COLABORADORES_ROUTES)
      },
      {
        path: 'asistencias',
        canMatch: [authMatchGuard],
        data: { permissions: ['asistencias:view'] },
        loadChildren: () => import('./modules/asistencias/asistencias.routes').then((m) => m.ASISTENCIAS_ROUTES)
      },
      {
        path: 'pagos',
        canMatch: [authMatchGuard],
        data: { permissions: ['pagos:manage'] },
        loadChildren: () => import('./modules/pagos/pagos.routes').then((m) => m.PAGOS_ROUTES)
      },
      {
        path: 'usuarios',
        canMatch: [authMatchGuard],
        data: { permissions: ['usuarios:manage'] },
        loadChildren: () => import('./modules/usuarios/usuarios.routes').then((m) => m.USUARIOS_ROUTES)
      },
      {
        path: 'alertas',
        canMatch: [authMatchGuard],
        data: { permissions: ['alertas:view'] },
        loadChildren: () => import('./modules/alertas/alertas.routes').then((m) => m.ALERTAS_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];