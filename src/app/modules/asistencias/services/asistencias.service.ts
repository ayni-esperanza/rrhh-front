import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../core/models/api.models';
import { AsistenciaCelda, AsistenciaMetric, AsistenciaSemana } from '../models/asistencia.model';
import { Observable } from 'rxjs';

export interface ApiAttendanceDetail { id: string; fecha: string; tipoRegistro: string; estado: string; observacion?: string; minutosNormales?: number; minutosExtras?: number; horaEntrada?: string; horaSalida?: string; entradaAlmuerzo?: string; salidaAlmuerzo?: string; lugarTrabajoId?: string; lugarTrabajo?: { nombre: string }; }
interface ApiDay extends Partial<ApiAttendanceDetail> { fecha: string; tipoRegistro: string; }
interface ApiPerson { id: string; nombres: string; apellidoPaterno: string; apellidoMaterno?: string; fotoUrl?: string; contratoActual?: { cargo?: { nombre: string } }; dias: ApiDay[]; totalMinutos: number; totalExtras: number; }
interface ApiMatrix extends PaginatedResponse<ApiPerson> { periodo: string; }
interface ApiMetrics { registros: number; minutosNormales: number; minutosExtras: number; faltas: number; incompletos: number; }
export interface JustificacionPayload { motivo: string; descripcion?: string; archivoUrl?: string; }
export interface AsistenciaPayload {
  horaEntrada?: string | null;
  horaSalida?: string | null;
  entradaAlmuerzo?: string | null;
  salidaAlmuerzo?: string | null;
  tipoRegistro: string;
  estado?: string;
  lugarTrabajoId?: string | null;
  feriadoTrabajado?: boolean;
  pagoPersonalizadoTipo?: string;
  pagoPersonalizadoValor?: number;
  observacion?: string;
}

@Injectable({ providedIn: 'root' })
export class AsistenciasService {
  private readonly http = inject(HttpClient);
  private readonly rows: AsistenciaSemana[] = [];
  private readonly metrics: AsistenciaMetric[] = [];
  constructor() { const now = new Date(); this.load(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`); }
  getMetrics(): AsistenciaMetric[] { return this.metrics; }
  getSemana(): AsistenciaSemana[] { return this.rows; }
  getMes(): AsistenciaSemana[] { return this.rows; }
  load(periodo: string): void {
    const params = { periodo, page: 1, limit: 100 };
    this.http.get<ApiMatrix>(`${environment.apiUrl}/asistencias/matriz`, { params }).subscribe(({ data }) => this.rows.splice(0, this.rows.length, ...data.map((x) => this.toView(x))));
    this.http.get<ApiMetrics>(`${environment.apiUrl}/asistencias/metricas`, { params }).subscribe((m) => this.metrics.splice(0, this.metrics.length,
      { label: 'Registros', value: String(m.registros), detail: 'Periodo seleccionado', icon: 'users', tone: 'blue' },
      { label: 'Horas trabajadas', value: this.hours(m.minutosNormales), detail: 'Horas normales', icon: 'clock', tone: 'amber' },
      { label: 'Horas extras', value: this.hours(m.minutosExtras), detail: 'Periodo seleccionado', icon: 'check', tone: 'emerald' },
      { label: 'Faltas', value: String(m.faltas), detail: 'Periodo seleccionado', icon: 'calendar', tone: 'rose' },
      { label: 'Registros incompletos', value: String(m.incompletos), detail: 'Pendientes de revisión', icon: 'user', tone: 'purple' }
    ));
  }
  save(colaboradorId: string, fecha: string, value: AsistenciaPayload): Observable<unknown> { return this.http.put(`${environment.apiUrl}/asistencias/${colaboradorId}/${fecha}`, this.attendancePayload(value)); }
  saveBulk(colaboradorIds: string[], fechas: string[], value: AsistenciaPayload): Observable<unknown> { return this.http.patch(`${environment.apiUrl}/asistencias/lote`, { colaboradorIds, fechas, ...this.attendancePayload(value) }); }
  getById(id: string): Observable<ApiAttendanceDetail> { return this.http.get<ApiAttendanceDetail>(`${environment.apiUrl}/asistencias/${id}`); }
  updateById(id: string, value: AsistenciaPayload): Observable<unknown> { return this.http.patch(`${environment.apiUrl}/asistencias/${id}`, this.attendancePayload(value)); }
  createJustification(id: string, value: JustificacionPayload): Observable<unknown> { return this.http.post(`${environment.apiUrl}/asistencias/${id}/justificacion`, this.justificationPayload(value)); }
  updateJustification(id: string, value: JustificacionPayload): Observable<unknown> { return this.http.patch(`${environment.apiUrl}/asistencias/${id}/justificacion`, this.justificationPayload(value)); }
  reviewJustification(id: string, estado: 'APROBADA' | 'RECHAZADA'): Observable<unknown> { return this.http.post(`${environment.apiUrl}/asistencias/${id}/justificacion/revisar`, { estado }); }
  approveJustification(id: string): Observable<unknown> { return this.http.post(`${environment.apiUrl}/asistencias/${id}/justificacion/aprobar`, {}); }
  rejectJustification(id: string): Observable<unknown> { return this.http.post(`${environment.apiUrl}/asistencias/${id}/justificacion/rechazar`, {}); }
  private attendancePayload(value: AsistenciaPayload): Record<string, unknown> {
    const payload: Record<string, unknown> = { tipoRegistro: value.tipoRegistro };
    const optionalKeys: Array<Exclude<keyof AsistenciaPayload, 'tipoRegistro'>> = ['horaEntrada', 'horaSalida', 'entradaAlmuerzo', 'salidaAlmuerzo', 'estado', 'lugarTrabajoId', 'feriadoTrabajado', 'pagoPersonalizadoTipo', 'pagoPersonalizadoValor', 'observacion'];
    for (const key of optionalKeys) if (value[key] !== undefined) payload[key] = value[key];
    return payload;
  }
  private justificationPayload(value: JustificacionPayload): JustificacionPayload {
    return { motivo: value.motivo, descripcion: value.descripcion, archivoUrl: value.archivoUrl };
  }
  private toView(x: ApiPerson): AsistenciaSemana { return { id: x.id, colaborador: [x.nombres, x.apellidoPaterno, x.apellidoMaterno].filter(Boolean).join(' '), cargo: x.contratoActual?.cargo?.nombre ?? '', avatar: x.fotoUrl ?? '', dias: x.dias.map((d) => this.day(d)), total: this.hours(x.totalMinutos), variacion: x.totalExtras ? `+${this.hours(x.totalExtras)}` : '-' }; }
  private day(d: ApiDay): AsistenciaCelda { const type = this.type(d.tipoRegistro); const total = Number(d.minutosNormales ?? 0) + Number(d.minutosExtras ?? 0); const date = new Date(`${d.fecha}T00:00:00`); return { id: d.id, dia: new Intl.DateTimeFormat('es-PE', { weekday: 'short' }).format(date).slice(0, 3), fecha: new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit' }).format(date), valor: total ? this.hours(total) : this.label(type), tipo: type, detalle: d.minutosExtras ? `+${this.hours(d.minutosExtras)}` : undefined, entrada: d.horaEntrada ?? '-', salida: d.horaSalida ?? '-', lugarId: d.lugarTrabajoId, lugar: d.lugarTrabajo?.nombre, estado: d.estado, observacion: d.observacion }; }
  private type(value: string): AsistenciaCelda['tipo'] { const map: Record<string, AsistenciaCelda['tipo']> = { NORMAL: 'normal', EXTRA: 'extra', PERMISO: 'permiso', FALTA: 'falta', FERIADO: 'feriado', FERIADO_TRABAJADO: 'feriado-trabajado', VACACIONES: 'vacaciones', RENUNCIA: 'renuncia', DESCANSO_MEDICO: 'descanso-medico', MATER_PATER: 'mater-pater', PROYECTO_TEMP: 'proyecto-temp', ESTUDIO: 'estudio', DESCANSO_EXTRA: 'descanso-extra', CUMPLEANOS: 'cumpleanos', NO_ESTA: 'no-esta' }; return map[value] ?? 'falta'; }
  private label(type: AsistenciaCelda['tipo']): string { return type === 'falta' ? '-' : type.replaceAll('-', ' '); }
  private hours(minutes: number): string { const h = Math.floor(Number(minutes) / 60); const m = Number(minutes) % 60; return m ? `${h}h ${m}m` : `${h}h`; }
}
