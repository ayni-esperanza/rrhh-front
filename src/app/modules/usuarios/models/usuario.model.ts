export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  password?: string;
  rol: 'admin' | 'rrhh' | 'supervisor' | 'colaborador';
  estado: 'activo' | 'inactivo';
  ultimoAcceso: string;
}
