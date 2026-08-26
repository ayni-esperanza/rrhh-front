export interface AsistenciaMetric {
  label: string;
  value: string;
  detail: string;
  icon: 'users' | 'check' | 'clock' | 'user' | 'calendar';
  tone: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
}

export interface AsistenciaDia {
  fecha: string;
  colaborador: string;
  cargo: string;
  avatar: string;
  horasTrabajadas: number;
  entrada: string;
  salida: string;
  lugar: string;
}

export interface AsistenciaSemana {
  id: string;
  colaborador: string;
  cargo: string;
  avatar: string;
  dias: AsistenciaCelda[];
  total: string;
  variacion: string;
}

export interface AsistenciaFilters {
  search: string;
  range: 'dia' | 'semana' | 'mes';
  month: string;
  weekIndex: number;
  dayIndex: number;
  visibleWeekIndexes: number[];
}

export interface AsistenciaCelda {
  dia: string;
  fecha: string;
  valor: string;
  tipo: 'normal' | 'extra' | 'permiso' | 'falta' | 'feriado' | 'feriado-trabajado' | 'vacaciones' | 'renuncia' | 'descanso-medico' | 'mater-pater' | 'proyecto-temp' | 'estudio' | 'descanso-extra' | 'cumpleanos' | 'no-esta';
  detalle?: string;
  pagoDetalle?: string;
  pagoPersonalizado?: {
    tipo: 'porcentaje' | 'multiplicador' | 'monto-fijo';
    valor: number;
  };
  entrada?: string;
  salida?: string;
  lugarId?: string;
  lugar?: string;
}



