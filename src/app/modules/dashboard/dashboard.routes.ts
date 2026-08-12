import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { DashboardReportPageComponent } from './pages/dashboard-report-page/dashboard-report-page.component';

export const DASHBOARD_ROUTES: Routes = [
  { path: '', component: DashboardPageComponent },
  { path: 'reportes/:reportId', component: DashboardReportPageComponent }
];
