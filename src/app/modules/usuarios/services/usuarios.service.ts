import { Injectable } from '@angular/core';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  getUsuarios(): Usuario[] {
    return [
      { id: 1, nombre: 'Administrador RR.HH.', correo: 'admin@rrhh.com', password: 'Admin#2025', rol: 'admin', estado: 'activo', ultimoAcceso: 'Hoy, 09:20 AM' },
      { id: 2, nombre: 'Supervisor', correo: 'supervisor@rrhh.com', password: 'Super#2025', rol: 'supervisor', estado: 'activo', ultimoAcceso: 'Ayer, 05:42 PM' },
      { id: 3, nombre: 'Analista RR.HH.', correo: 'analista@rrhh.com', password: 'Analista#25', rol: 'rrhh', estado: 'inactivo', ultimoAcceso: '12 May 2025' },
      { id: 4, nombre: 'Luis Alberto Romero', correo: 'luis.romero@empresa.com', password: 'Luis#2025', rol: 'colaborador', estado: 'activo', ultimoAcceso: 'Hoy, 07:58 AM' }
    ];
  }
}
