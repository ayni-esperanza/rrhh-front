import { Injectable } from '@angular/core';
import { Alerta } from '../models/alerta.model';

@Injectable({ providedIn: 'root' })
export class AlertasService {
  getAlertas(): Alerta[] {
    return [
      { titulo: '2 inasistencias sin justificar', tipo: 'inasistencia', prioridad: 'alta' },
      { titulo: 'Pago pendiente de validación', tipo: 'pago', prioridad: 'media' },
      { titulo: 'Contrato próximo a vencer', tipo: 'vencimiento', prioridad: 'alta' }
    ];
  }
}