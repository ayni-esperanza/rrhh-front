import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../core/models/api.models';
export interface Feriado { id: string; nombre: string; fecha: string; activo: boolean; color: string; }
@Injectable({ providedIn: 'root' })
export class FeriadosService {
  private readonly http = inject(HttpClient); private readonly url = `${environment.apiUrl}/feriados`;
  list(periodo?: string) { return this.http.get<PaginatedResponse<Feriado>>(this.url, { params: { page: 1, limit: 100, ...(periodo ? { periodo } : {}) } }).pipe(map((x) => x.data)); }
  get(id: string) { return this.http.get<Feriado>(`${this.url}/${id}`); }
  getRule(fecha: string) { return this.http.get<Record<string, unknown>>(`${this.url}/fecha/${fecha}/regla`); }
  create(value: { nombre: string; fecha: string }) { return this.http.post<Feriado>(this.url, value); }
  update(id: string, value: Partial<Pick<Feriado, 'nombre' | 'fecha' | 'activo'>>) { return this.http.patch<Feriado>(`${this.url}/${id}`, value); }
  deactivate(id: string) { return this.http.patch<Feriado>(`${this.url}/${id}`, { activo: false }); }
  delete(id: string) { return this.http.delete<void>(`${this.url}/${id}`); }
  calculatePayment(id: string, remuneracionMensual: number, horasTrabajadas: number) { return this.http.post<Record<string, unknown>>(`${this.url}/${id}/calcular-pago`, { remuneracionMensual, horasTrabajadas }); }
}
