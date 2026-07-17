import { Injectable } from '@angular/core';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  getUsuarios(): Usuario[] {
    return [
      { nombre: 'Administrador RR.HH.', correo: 'admin@rrhh.com', rol: 'admin', estado: 'activo' },
      { nombre: 'Supervisor', correo: 'supervisor@rrhh.com', rol: 'supervisor', estado: 'activo' },
      { nombre: 'Analista RR.HH.', correo: 'analista@rrhh.com', rol: 'rrhh', estado: 'inactivo' }
    ];
  }
}