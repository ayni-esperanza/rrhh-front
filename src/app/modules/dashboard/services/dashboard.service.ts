import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface DashboardSummary { periodo: string; colaboradores: { total: number; activos: number }; asistencia: { registros: number; faltas: number; minutos_normales: number; minutos_extras: number }; planilla: { total: number; pagado: number; pendiente: number }; }
export interface DashboardAttendance { periodo: string; data: Array<{ area: string; registros: number; faltas: number; minutos_normales: number; minutos_extras: number }> }
export interface DashboardCosts { periodo: string; data: Array<{ area: string; colaboradores: number; monto_programado: number; total_pagado: number; saldo_pendiente: number }> }
export interface DashboardRankings { periodo: string; llegadasTempranas: Array<{ colaborador: string; minutos_antes: number }>; tardanzas: Array<{ colaborador: string; tardanzas: number }>; faltas: Array<{ colaborador: string; faltas: number }> }

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/dashboard`;
  getDashboard(periodo: string) {
    const params = { periodo };
    return forkJoin({
      summary: this.http.get<DashboardSummary>(`${this.url}/resumen`, { params }),
      attendance: this.http.get<DashboardAttendance>(`${this.url}/asistencia`, { params }),
      costs: this.http.get<DashboardCosts>(`${this.url}/costos`, { params }),
      rankings: this.http.get<DashboardRankings>(`${this.url}/rankings`, { params })
    });
  }
  getReport(type: string, periodo: string) { return this.http.get<Record<string, unknown>>(`${this.url}/reportes/${type}`, { params: { periodo } }); }
}
