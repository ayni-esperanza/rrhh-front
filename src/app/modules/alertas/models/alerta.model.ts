export interface Alerta {
  id: number;
  titulo: string;
  colaborador: string;
  detalle: string;
  fecha: string;
  tipo: 'inasistencia' | 'pago' | 'cumpleanos' | 'antiguedad';
  prioridad: 'alta' | 'media' | 'baja';
  aniosTrabajo?: number;
  visto?: boolean;
}
