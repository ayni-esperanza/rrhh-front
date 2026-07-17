import { Injectable } from '@angular/core';
import { AsistenciaDia } from '../models/asistencia.model';

const ASISTENCIAS: AsistenciaDia[] = [
  { fecha: '2026-07-17', colaborador: 'Ana Torres', horasTrabajadas: 8, entrada: '08:00', salida: '17:00', lugar: 'Oficina central' },
  { fecha: '2026-07-17', colaborador: 'Luis Vargas', horasTrabajadas: 9, entrada: '07:30', salida: '17:30', lugar: 'Proyecto Norte' },
  { fecha: '2026-07-17', colaborador: 'Marta Ríos', horasTrabajadas: 6, entrada: '09:00', salida: '15:00', lugar: 'Remoto' }
];

@Injectable({ providedIn: 'root' })
export class AsistenciasService {
  getAsistencias(): AsistenciaDia[] {
    return ASISTENCIAS;
  }
}