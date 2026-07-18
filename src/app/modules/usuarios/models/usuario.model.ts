export interface Usuario {
  nombre: string;
  correo: string;
  rol: 'admin' | 'rrhh' | 'supervisor' | 'colaborador';
  estado: 'activo' | 'inactivo';
  ultimoAcceso: string;
}
