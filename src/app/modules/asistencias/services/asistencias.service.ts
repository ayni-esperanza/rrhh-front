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
