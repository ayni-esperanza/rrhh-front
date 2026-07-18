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
  mesCompleto: string;
  estado: 'Pagado' | 'Abonado' | 'Pendiente';
  monto: string;
  referencia: string;
  montoProgramado: string;
  pagadoAbonado: string;
  pendiente: string;
  fechaPago: string;
  responsable: string;
  entidadMedio: string;
}
