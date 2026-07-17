export interface Pago {
  colaborador: string;
  periodo: string;
  monto: number;
  estado: 'pendiente' | 'pagado' | 'observado';
}