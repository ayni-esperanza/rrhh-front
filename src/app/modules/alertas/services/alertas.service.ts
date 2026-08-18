import { Injectable } from '@angular/core';
import { Alerta } from '../models/alerta.model';

@Injectable({ providedIn: 'root' })
export class AlertasService {
  getAlertas(): Alerta[] {
    return [
      { id: 1, titulo: '2 inasistencias sin justificar', colaborador: 'Luis Alberto Romero', detalle: 'Registros pendientes del 12 y 15 de agosto.', fecha: '18/08/2026', tipo: 'inasistencia', prioridad: 'alta' },
      { id: 2, titulo: 'Pago pendiente de validación', colaborador: 'María Fernanda López', detalle: 'La transferencia de agosto requiere confirmación.', fecha: '18/08/2026', tipo: 'pago', prioridad: 'alta' },
      { id: 3, titulo: 'Cumpleaños próximo', colaborador: 'Diego Sánchez Pérez', detalle: 'Cumpleaños dentro de 3 días.', fecha: '21/08/2026', tipo: 'cumpleanos', prioridad: 'baja' },
      { id: 4, titulo: '5 años en la empresa', colaborador: 'Carla Mendoza Díaz', detalle: 'Reconocimiento por aniversario laboral.', fecha: '20/08/2026', tipo: 'antiguedad', prioridad: 'media', aniosTrabajo: 5 },
      { id: 5, titulo: 'Inasistencia sin sustento', colaborador: 'Ana Lucía Rojas', detalle: 'No se adjuntó justificación para el 17 de agosto.', fecha: '17/08/2026', tipo: 'inasistencia', prioridad: 'alta' },
      { id: 6, titulo: 'Pago observado', colaborador: 'José Manuel Torres', detalle: 'La cuenta bancaria registrada no pudo validarse.', fecha: '16/08/2026', tipo: 'pago', prioridad: 'media' },
      { id: 7, titulo: 'Cumpleaños del mes', colaborador: 'Oscar Huamán', detalle: 'Cumpleaños programado para el 26 de agosto.', fecha: '26/08/2026', tipo: 'cumpleanos', prioridad: 'baja' },
      { id: 8, titulo: '3 años en la empresa', colaborador: 'Ana Lucía Rojas', detalle: 'Aniversario laboral durante esta semana.', fecha: '22/08/2026', tipo: 'antiguedad', prioridad: 'baja', aniosTrabajo: 3 },
      { id: 9, titulo: '3 inasistencias acumuladas', colaborador: 'Oscar Huamán', detalle: 'Superó el umbral mensual de inasistencias.', fecha: '15/08/2026', tipo: 'inasistencia', prioridad: 'alta' },
      { id: 10, titulo: 'Abono incompleto', colaborador: 'Diego Sánchez Pérez', detalle: 'Existe un saldo pendiente de S/ 420.00.', fecha: '14/08/2026', tipo: 'pago', prioridad: 'alta' },
      { id: 11, titulo: 'Cumpleaños próximo', colaborador: 'María Fernanda López', detalle: 'Cumpleaños dentro de 10 días.', fecha: '28/08/2026', tipo: 'cumpleanos', prioridad: 'baja' },
      { id: 12, titulo: '10 años en la empresa', colaborador: 'José Manuel Torres', detalle: 'Reconocimiento por una década de servicio.', fecha: '30/08/2026', tipo: 'antiguedad', prioridad: 'media', aniosTrabajo: 10 },
      { id: 13, titulo: 'Marcación incompleta', colaborador: 'Carla Mendoza Díaz', detalle: 'No registra ingreso ni salida del 13 de agosto.', fecha: '13/08/2026', tipo: 'inasistencia', prioridad: 'media' },
      { id: 14, titulo: 'Pago por aprobar', colaborador: 'Luis Alberto Romero', detalle: 'Planilla de agosto pendiente de aprobación.', fecha: '12/08/2026', tipo: 'pago', prioridad: 'media' },
      { id: 15, titulo: '1 año en la empresa', colaborador: 'Diego Sánchez Pérez', detalle: 'Primer aniversario laboral.', fecha: '25/08/2026', tipo: 'antiguedad', prioridad: 'baja', aniosTrabajo: 1 },
      { id: 16, titulo: 'Cumpleaños de hoy', colaborador: 'Luis Alberto Romero', detalle: 'Enviar saludo institucional.', fecha: '18/08/2026', tipo: 'cumpleanos', prioridad: 'media' }
    ];
  }
}
