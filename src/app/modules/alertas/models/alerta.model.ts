export interface Alerta {
  id: string;
  titulo: string;
  colaborador: string;
  detalle: string;
  fecha: string;
  tipo: 'inasistencia' | 'pago' | 'cumpleanos' | 'antiguedad' | 'documento';
  prioridad: 'alta' | 'media' | 'baja';
  aniosTrabajo?: number;
  visto?: boolean;
}
