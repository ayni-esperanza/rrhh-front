import { Injectable } from '@angular/core';
import { Colaborador } from '../models/colaborador.model';

@Injectable({ providedIn: 'root' })
export class ColaboradoresService {
  getColaboradores(): Colaborador[] {
    return [
      { id: 'C-001', nombres: 'Ana Torres', cargo: 'Analista RR.HH.', area: 'Gestión Humana', estado: 'activo' },
      { id: 'C-002', nombres: 'Luis Vargas', cargo: 'Supervisor', area: 'Operaciones', estado: 'activo' },
      { id: 'C-003', nombres: 'Marta Ríos', cargo: 'Asistente', area: 'Administración', estado: 'inactivo' }
    ];
  }
}