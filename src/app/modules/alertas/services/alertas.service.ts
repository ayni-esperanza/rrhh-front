import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../core/models/api.models';
import { Alerta } from '../models/alerta.model';

interface ApiAlerta { id: string; titulo: string; detalle: string; fecha: string; tipo: string; prioridad: string; vistoAt: string | null; colaborador?: { nombres: string; apellidoPaterno: string; apellidoMaterno?: string }; }
export interface AlertasMetrics { total: number; pendientes: number; alta: number; media: number; }

@Injectable({ providedIn: 'root' })
export class AlertasService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/alertas`;
  getAlertas(): Observable<Alerta[]> {
    return this.http.get<PaginatedResponse<ApiAlerta>>(this.url, { params: { page: 1, limit: 100 } }).pipe(map(({ data }) => data.map((item) => ({
      id: item.id, titulo: item.titulo, detalle: item.detalle,
      colaborador: item.colaborador ? [item.colaborador.nombres, item.colaborador.apellidoPaterno, item.colaborador.apellidoMaterno].filter(Boolean).join(' ') : 'Sin colaborador',
      fecha: new Intl.DateTimeFormat('es-PE').format(new Date(`${item.fecha}T00:00:00`)),
      tipo: item.tipo.toLowerCase() as Alerta['tipo'], prioridad: item.prioridad.toLowerCase() as Alerta['prioridad'], visto: Boolean(item.vistoAt)
    }))));
  }
  getMetrics(): Observable<AlertasMetrics> { return this.http.get<AlertasMetrics>(`${this.url}/metricas`); }
  generate(): Observable<unknown> { return this.http.post(`${this.url}/generar`, {}); }
  markAsSeen(id: string): Observable<void> { return this.http.patch<void>(`${this.url}/${id}/visto`, {}); }
  markAllAsSeen(): Observable<void> { return this.http.patch<void>(`${this.url}/marcar-todas-vistas`, {}); }
}
