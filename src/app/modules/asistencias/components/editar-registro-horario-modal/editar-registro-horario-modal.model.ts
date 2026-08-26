export interface AsistenciaRegistroEdicion {
  asistenciaId?: string;
  colaborador: string;
  cargo: string;
  avatar: string;
  fecha: string;
  entrada: string;
  salida: string;
  entradaAlmuerzo: string;
  salidaAlmuerzo: string;
  horasNormales: string;
  horasExtras: string;
  tipoRegistro: string;
  feriadoTrabajado?: boolean;
  usarPagoPersonalizado?: boolean;
  pagoPersonalizadoTipo?: 'porcentaje' | 'multiplicador' | 'monto-fijo';
  pagoPersonalizadoValor?: number;
  estado: string;
  lugar: string;
  observacion?: string;
  justificacionMotivo?: string;
  justificacionDescripcion?: string;
}
