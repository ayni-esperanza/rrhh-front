export interface PagoMetric {
  label: string;
  value: string;
  detail: string;
  icon: 'users' | 'wallet' | 'card' | 'money' | 'calendar';
  tone: 'blue' | 'emerald' | 'orange' | 'purple' | 'rose';
}

export interface PagoColaborador {
  id: number;
  nombre: string;
  cargo: string;
  avatar: string;
  montoMensual: string;
  fechaPago: string;
  horaPago: string;
  cta: string;
  cci: string;
  banco: string;
  meses: PagoMes[];
}

export interface PagoMes {
  mes: string;
  estado: 'Pagado' | 'Abonado' | 'Pendiente';
  monto: string;
  referencia: string;
}
