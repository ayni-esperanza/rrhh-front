export interface PagoMetric {
  label: string;
  value: string;
  detail: string;
  icon: 'users' | 'wallet' | 'card' | 'money' | 'calendar';
  tone: 'blue' | 'emerald' | 'orange' | 'purple' | 'rose';
}

export interface PagoColaborador {
  id: string;
  nombre: string;
  cargo: string;
  area: string;
  avatar: string;
  montoMensual: string;
  fechaPago: string;
  horaPago: string;
  cta: string;
  cci: string;
  banco: string;
  cuentasBancarias: PagoCuentaBancaria[];
  meses: PagoMes[];
}

export interface PagoCuentaBancaria {
  cuentaBancaria: string;
  cci: string;
  entidadBancaria: string;
  esPrincipal: boolean;
}

export interface PagoMes {
  id: string;
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
  movimientos: PagoMovimiento[];
}

export interface PagoMovimiento {
  id: string;
  numero: number;
  monto: string;
  fechaPago: string;
  horaPago: string;
  responsable: string;
  entidadMedio: string;
  observacion: string;
  estado: string;
}
