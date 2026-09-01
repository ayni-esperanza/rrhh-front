import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard-page/dashboard-page.component').then((m) => m.DashboardPageComponent)
  },
  {
    path: 'reportes/:reportId',
    loadComponent: () => import('./pages/dashboard-report-page/dashboard-report-page.component').then((m) => m.DashboardReportPageComponent)
  }
];
