export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  password: string;
  rol: 'admin' | 'rrhh' | 'supervisor' | 'colaborador';
  estado: 'activo' | 'inactivo';
  ultimoAcceso: string;
}
