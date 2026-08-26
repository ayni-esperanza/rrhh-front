import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../core/models/api.models';
export interface LugarTrabajo { id: string; nombre: string; color: string; locked?: boolean; }
interface ApiLugar { id: string; nombre: string; color: string; bloqueado: boolean; }
@Injectable({ providedIn: 'root' })
export class LugaresTrabajoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/lugares-trabajo`;
  private readonly lugares: LugarTrabajo[] = [];
  constructor() { this.reload(); }
  getLugares(): LugarTrabajo[] { return this.lugares; }
  getOpciones(): string[] { return this.lugares.map((x) => x.nombre); }
  findByName(nombre: string): LugarTrabajo { return this.lugares.find((x) => x.nombre === nombre) ?? { id: '', nombre: 'Sin registro', color: '#94a3b8', locked: true }; }
  addLugar(nombre: string, color: string): void { this.http.post<ApiLugar>(this.url, { nombre: nombre.trim(), color }).subscribe(() => this.reload()); }
  updateLugar(id: string, nombre: string, color: string): void { this.http.patch<ApiLugar>(`${this.url}/${id}`, { nombre: nombre.trim(), color }).subscribe(() => this.reload()); }
  removeLugar(id: string): void { this.http.delete<void>(`${this.url}/${id}`).subscribe(() => this.reload()); }
  private reload(): void { this.http.get<PaginatedResponse<ApiLugar>>(this.url, { params: { page: 1, limit: 100, activo: true } }).subscribe(({ data }) => this.lugares.splice(0, this.lugares.length, ...data.map((x) => ({ id: x.id, nombre: x.nombre, color: x.color, locked: x.bloqueado })))); }
}
