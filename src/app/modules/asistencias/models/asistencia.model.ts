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
  id: number;
  colaborador: string;
  cargo: string;
  avatar: string;
  dias: AsistenciaCelda[];
  total: string;
  variacion: string;
}

export interface AsistenciaCelda {
  dia: string;
  fecha: string;
  valor: string;
  tipo: 'normal' | 'extra' | 'permiso' | 'falta';
  detalle?: string;
}
