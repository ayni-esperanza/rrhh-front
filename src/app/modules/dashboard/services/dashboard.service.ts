import { Injectable } from '@angular/core';
import { DashboardIndicator } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  getIndicators(): DashboardIndicator[] {
    return [
      { label: 'Colaboradores activos', value: '128', detail: 'Distribuidos en 8 áreas' },
      { label: 'Asistencias hoy', value: '116', detail: '91% registrado' },
      { label: 'Pagos pendientes', value: '7', detail: 'Requieren validación' },
      { label: 'Alertas abiertas', value: '12', detail: 'Inasistencias y vencimientos' }
    ];
  }
}