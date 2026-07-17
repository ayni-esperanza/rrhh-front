import { Injectable } from '@angular/core';
import { Reporte } from '../models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  getReportes(): Reporte[] {
    return [
      { nombre: 'Asistencia mensual', tipo: 'Asistencias', ultimaGeneracion: '2026-07-15' },
      { nombre: 'Planilla general', tipo: 'Pagos', ultimaGeneracion: '2026-07-16' },
      { nombre: 'Colaboradores activos', tipo: 'Colaboradores', ultimaGeneracion: '2026-07-10' }
    ];
  }
}