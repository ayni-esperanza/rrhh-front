import { Injectable } from '@angular/core';
import { AsistenciaDia, AsistenciaMetric, AsistenciaSemana } from '../models/asistencia.model';

const SEMANA: AsistenciaSemana[] = [
  {
    id: 1,
    colaborador: 'Luis Alberto Romero',
    cargo: 'Tecnico Mecanico',
    avatar: 'https://i.pravatar.cc/96?img=12',
    dias: [
      { dia: 'Lun', fecha: '05/05', valor: '8h 30m', tipo: 'normal' },
      { dia: 'Mar', fecha: '06/05', valor: '8h 45m', tipo: 'normal' },
      { dia: 'Mie', fecha: '07/05', valor: '8h 30m', tipo: 'normal' },
      { dia: 'Jue', fecha: '08/05', valor: '9h 15m', tipo: 'extra', detalle: '+1h 15m' },
      { dia: 'Vie', fecha: '09/05', valor: '8h 30m', tipo: 'normal' },
      { dia: 'Sab', fecha: '10/05', valor: '-', tipo: 'permiso' },
      { dia: 'Dom', fecha: '11/05', valor: '-', tipo: 'falta' }
    ],
    total: '43h 30m',
    variacion: '+1h 15m'
  },
  {
    id: 2,
    colaborador: 'Maria Fernanda Lopez',
    cargo: 'Supervisora',
    avatar: 'https://i.pravatar.cc/96?img=47',
    dias: [
      { dia: 'Lun', fecha: '05/05', valor: '8h 20m', tipo: 'normal' },
      { dia: 'Mar', fecha: '06/05', valor: '8h 30m', tipo: 'normal' },
      { dia: 'Mie', fecha: '07/05', valor: '8h 20m', tipo: 'normal' },
      { dia: 'Jue', fecha: '08/05', valor: '8h 20m', tipo: 'normal' },
      { dia: 'Vie', fecha: '09/05', valor: '8h 30m', tipo: 'normal' },
      { dia: 'Sab', fecha: '10/05', valor: '-', tipo: 'permiso' },
      { dia: 'Dom', fecha: '11/05', valor: '-', tipo: 'falta' }
    ],
    total: '41h 40m',
    variacion: '-'
  },
  {
    id: 3,
    colaborador: 'Diego Sanchez Perez',
    cargo: 'Soldador',
    avatar: 'https://i.pravatar.cc/96?img=13',
    dias: [
      { dia: 'Lun', fecha: '05/05', valor: '7h 50m', tipo: 'normal' },
      { dia: 'Mar', fecha: '06/05', valor: '8h 10m', tipo: 'normal' },
      { dia: 'Mie', fecha: '07/05', valor: '8h 05m', tipo: 'normal' },
      { dia: 'Jue', fecha: '08/05', valor: '8h 30m', tipo: 'normal' },
      { dia: 'Vie', fecha: '09/05', valor: '8h 00m', tipo: 'normal' },
      { dia: 'Sab', fecha: '10/05', valor: 'Permiso', tipo: 'permiso' },
      { dia: 'Dom', fecha: '11/05', valor: '-', tipo: 'falta' }
    ],
    total: '40h 35m',
    variacion: '-'
  },
  {
    id: 4,
    colaborador: 'Ana Lucia Rojas',
    cargo: 'Operaria',
    avatar: 'https://i.pravatar.cc/96?img=32',
    dias: [
      { dia: 'Lun', fecha: '05/05', valor: '8h 30m', tipo: 'normal' },
      { dia: 'Mar', fecha: '06/05', valor: '8h 30m', tipo: 'normal' },
      { dia: 'Mie', fecha: '07/05', valor: '8h 30m', tipo: 'normal' },
      { dia: 'Jue', fecha: '08/05', valor: '8h 30m', tipo: 'normal' },
      { dia: 'Vie', fecha: '09/05', valor: '8h 30m', tipo: 'normal' },
      { dia: 'Sab', fecha: '10/05', valor: '-', tipo: 'permiso' },
      { dia: 'Dom', fecha: '11/05', valor: '-', tipo: 'falta' }
    ],
    total: '42h 30m',
    variacion: '-'
  },
  {
    id: 5,
    colaborador: 'Jose Manuel Torres',
    cargo: 'Electricista',
    avatar: 'https://i.pravatar.cc/96?img=11',
    dias: [
      { dia: 'Lun', fecha: '05/05', valor: '8h 30m', tipo: 'normal' },
      { dia: 'Mar', fecha: '06/05', valor: '9h 00m', tipo: 'extra', detalle: '+30m' },
      { dia: 'Mie', fecha: '07/05', valor: '8h 30m', tipo: 'normal' },
      { dia: 'Jue', fecha: '08/05', valor: '8h 30m', tipo: 'normal' },
      { dia: 'Vie', fecha: '09/05', valor: '9h 10m', tipo: 'extra', detalle: '+40m' },
      { dia: 'Sab', fecha: '10/05', valor: '-', tipo: 'permiso' },
      { dia: 'Dom', fecha: '11/05', valor: '-', tipo: 'falta' }
    ],
    total: '43h 40m',
    variacion: '+1h 10m'
  }
];

const MONTH_DAYS = [
  { dia: 'Lun', fecha: '05/05' }, { dia: 'Mar', fecha: '06/05' }, { dia: 'Mie', fecha: '07/05' }, { dia: 'Jue', fecha: '08/05' }, { dia: 'Vie', fecha: '09/05' }, { dia: 'Sab', fecha: '10/05' }, { dia: 'Dom', fecha: '11/05' },
  { dia: 'Lun', fecha: '12/05' }, { dia: 'Mar', fecha: '13/05' }, { dia: 'Mie', fecha: '14/05' }, { dia: 'Jue', fecha: '15/05' }, { dia: 'Vie', fecha: '16/05' }, { dia: 'Sab', fecha: '17/05' }, { dia: 'Dom', fecha: '18/05' },
  { dia: 'Lun', fecha: '19/05' }, { dia: 'Mar', fecha: '20/05' }, { dia: 'Mie', fecha: '21/05' }, { dia: 'Jue', fecha: '22/05' }, { dia: 'Vie', fecha: '23/05' }, { dia: 'Sab', fecha: '24/05' }, { dia: 'Dom', fecha: '25/05' },
  { dia: 'Lun', fecha: '26/05' }, { dia: 'Mar', fecha: '27/05' }, { dia: 'Mie', fecha: '28/05' }, { dia: 'Jue', fecha: '29/05' }, { dia: 'Vie', fecha: '30/05' }, { dia: 'Sab', fecha: '31/05' }, { dia: 'Dom', fecha: '01/06' }
];

const EXTRA_DAYS = [
  [3, 11, 18, 24],
  [8, 17, 23],
  [4, 15],
  [10, 16, 25],
  [1, 10, 18, 25]
];

const PERMISSION_DAYS = [
  [5, 20],
  [12],
  [5, 15, 26],
  [19],
  [12, 20]
];

const MISSING_DAYS = [
  [6],
  [13, 27],
  [9],
  [20],
  [6]
];

const SPECIAL_DAYS: Record<number, Record<number, { valor: string; tipo: AsistenciaSemana['dias'][number]['tipo']; detalle?: string }>> = {
  0: {
    5: { valor: 'Estudio', tipo: 'estudio' },
    12: { valor: 'Vacaciones', tipo: 'vacaciones' },
    20: { valor: 'Cumpleaños', tipo: 'cumpleanos' }
  },
  1: {
    6: { valor: 'Feriado', tipo: 'feriado' },
    13: { valor: 'Desc. medico', tipo: 'descanso-medico' },
    24: { valor: 'Mater/Pater', tipo: 'mater-pater' }
  },
  2: {
    9: { valor: 'Proyecto', tipo: 'proyecto-temp' },
    15: { valor: 'Desc. h. extras', tipo: 'descanso-extra' },
    26: { valor: 'Renuncia', tipo: 'renuncia' }
  },
  3: {
    11: { valor: 'No esta', tipo: 'no-esta' },
    19: { valor: 'Permiso', tipo: 'permiso' }
  },
  4: {
    4: { valor: 'Desc. medico', tipo: 'descanso-medico' },
    12: { valor: 'Vacaciones', tipo: 'vacaciones' },
    20: { valor: 'Feriado', tipo: 'feriado' }
  }
};
const MES: AsistenciaSemana[] = SEMANA.map((item, index) => {
  const dias = createMonthCells(index);
  return {
    ...item,
    dias,
    total: formatMinutes(sumWorkedMinutes(dias)),
    variacion: formatExtraMinutes(dias)
  };
});

function createMonthCells(profileIndex: number) {
  return MONTH_DAYS.map((day, dayIndex) => {
    if (MISSING_DAYS[profileIndex]?.includes(dayIndex)) {
      return { ...day, valor: '-', tipo: 'falta' as const };
    }

    if (PERMISSION_DAYS[profileIndex]?.includes(dayIndex) || dayIndex % 7 === 5) {
      return { ...day, valor: '-', tipo: 'permiso' as const };
    }

    if (dayIndex % 7 === 6) {
      return { ...day, valor: '-', tipo: 'falta' as const };
    }

    if (EXTRA_DAYS[profileIndex]?.includes(dayIndex)) {
      const minutes = 545 + ((profileIndex + dayIndex) % 3) * 15;
      return { ...day, valor: formatMinutes(minutes), tipo: 'extra' as const, detalle: `+${formatMinutes(minutes - 510)}` };
    }

    const minutes = 495 + ((profileIndex + dayIndex) % 4) * 10;
    return { ...day, valor: formatMinutes(minutes), tipo: 'normal' as const };
  });
}

function sumWorkedMinutes(dias: Array<{ valor: string; tipo: string }>): number {
  return dias.reduce((total, dia) => dia.tipo === 'normal' || dia.tipo === 'extra' ? total + parseMinutes(dia.valor) : total, 0);
}

function formatExtraMinutes(dias: Array<{ tipo: string; detalle?: string }>): string {
  const minutes = dias.reduce((total, dia) => total + parseMinutes(dia.detalle?.replace('+', '') ?? '0h'), 0);
  return minutes ? `+${formatMinutes(minutes)}` : '-';
}

function parseMinutes(value: string): number {
  const match = value.match(/(\d+)h(?:\s*(\d+)m)?/);
  return match ? Number(match[1]) * 60 + Number(match[2] ?? 0) : 0;
}

function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

@Injectable({ providedIn: 'root' })
export class AsistenciasService {
  getMetrics(): AsistenciaMetric[] {
    return [
      { label: 'Colaboradores activos', value: '186', detail: 'Presentes hoy 142 (76.3%)', icon: 'users', tone: 'blue' },
      { label: 'Asistencia promedio (mes)', value: '92.4%', detail: '3.6% vs mes anterior', icon: 'check', tone: 'emerald' },
      { label: 'Horas trabajadas (mes)', value: '8.452 h', detail: '12.5% vs mes anterior', icon: 'clock', tone: 'amber' },
      { label: 'Ausentismo (mes)', value: '7.6%', detail: '-1.2% vs mes anterior', icon: 'user', tone: 'purple' },
      { label: 'Faltas (mes)', value: '24', detail: 'Justificadas: 10 | Injustificadas: 14', icon: 'calendar', tone: 'rose' }
    ];
  }

  getSemana(): AsistenciaSemana[] {
    return SEMANA;
  }

  getMes(): AsistenciaSemana[] {
    return MES;
  }

  getAsistencias(): AsistenciaDia[] {
    return SEMANA.map((item) => ({
      fecha: '2025-05-09',
      colaborador: item.colaborador,
      cargo: item.cargo,
      avatar: item.avatar,
      horasTrabajadas: Number.parseInt(item.total, 10),
      entrada: item.id === 2 ? '08:10' : '08:00',
      salida: item.id === 5 ? '18:10' : '17:30',
      lugar: item.id % 2 === 0 ? 'Oficina central' : 'Proyecto Norte'
    }));
  }
}

