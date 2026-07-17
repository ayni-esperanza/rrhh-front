export interface Colaborador {
  id: string;
  nombres: string;
  cargo: string;
  area: string;
  estado: 'activo' | 'inactivo';
}