import { Routes } from '@angular/router';
import { AsistenciasLayoutComponent } from './pages/asistencias-layout/asistencias-layout.component';
import { EntradaSalidaPageComponent } from './pages/entrada-salida-page/entrada-salida-page.component';
import { HorasDiaPageComponent } from './pages/horas-dia-page/horas-dia-page.component';
import { LugarTrabajoPageComponent } from './pages/lugar-trabajo-page/lugar-trabajo-page.component';

export const ASISTENCIAS_ROUTES: Routes = [
  {
    path: '',
    component: AsistenciasLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'horas-dia' },
      { path: 'horas-dia', component: HorasDiaPageComponent },
      { path: 'entrada-salida', component: EntradaSalidaPageComponent },
      { path: 'lugar-trabajo', component: LugarTrabajoPageComponent }
    ]
  }
];