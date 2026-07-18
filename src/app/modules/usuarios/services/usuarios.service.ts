import { Injectable } from '@angular/core';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  getUsuarios(): Usuario[] {
    return [
      { nombre: 'Administrador RR.HH.', correo: 'admin@rrhh.com', rol: 'admin', estado: 'activo', ultimoAcceso: 'Hoy, 09:20 AM' },
      { nombre: 'Supervisor', correo: 'supervisor@rrhh.com', rol: 'supervisor', estado: 'activo', ultimoAcceso: 'Ayer, 05:42 PM' },
      { nombre: 'Analista RR.HH.', correo: 'analista@rrhh.com', rol: 'rrhh', estado: 'inactivo', ultimoAcceso: '12 May 2025' },
      { nombre: 'Luis Alberto Romero', correo: 'luis.romero@empresa.com', rol: 'colaborador', estado: 'activo', ultimoAcceso: 'Hoy, 07:58 AM' }
    ];
  }
}
