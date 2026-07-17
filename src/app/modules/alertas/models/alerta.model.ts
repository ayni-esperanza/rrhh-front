export interface Alerta {
  titulo: string;
  tipo: 'inasistencia' | 'pago' | 'vencimiento';
  prioridad: 'alta' | 'media' | 'baja';
}