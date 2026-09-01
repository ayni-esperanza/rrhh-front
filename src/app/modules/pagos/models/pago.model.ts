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
  modalidadPago: string;
  cta: string;
  cci: string;
  banco: string;
  cuentasBancarias: PagoCuentaBancaria[];
  meses: PagoMes[];
}

export interface PagoCuentaBancaria {
  id: string;
  cuentaBancaria: string;
  cci: string;
  entidadBancaria: string;
  esPrincipal: boolean;
}

export interface PagoMes {
  id: string;
  year: number;
  monthNumber: number;
  mes: string;
  mesCompleto: string;
  estado: 'Pagado' | 'Abonado' | 'Pendiente';
  monto: string;
  referencia: string;
  montoProgramado: string;
  pagadoAbonado: string;
  pendiente: string;
  fechaPago: string;
  fechasProgramadas: string[];
  responsable: string;
  entidadMedio: string;
  movimientos: PagoMovimiento[];
  conceptos: PagoConcepto[];
}

export interface PagoConcepto {
  id: string;
  descripcion: string;
  naturaleza: 'INGRESO' | 'DESCUENTO';
  monto: number;
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
