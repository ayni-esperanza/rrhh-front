import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../core/models/api.models';
import { Usuario } from '../models/usuario.model';

interface ApiUsuario {
  id: string; nombre: string; correo: string; estado: 'ACTIVO' | 'INACTIVO';
  ultimoAccesoAt: string | null; rol: { codigo: Usuario['rol'] };
}
export interface UsuariosMetrics { total: number; activos: number; inactivos: number; accesosMes: number; }

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/usuarios`;

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<PaginatedResponse<ApiUsuario>>(this.url, { params: { page: 1, limit: 100 } }).pipe(map(({ data }) => data.map((item) => this.toView(item))));
  }
  getMetrics(): Observable<UsuariosMetrics> { return this.http.get<UsuariosMetrics>(`${this.url}/metricas`); }
  getById(id: string): Observable<Usuario> { return this.http.get<ApiUsuario>(`${this.url}/${id}`).pipe(map((item) => this.toView(item))); }
  create(usuario: Usuario): Observable<{ usuario: Usuario; temporaryPassword: string }> {
    return this.http.post<{ usuario: ApiUsuario; temporaryPassword: string }>(this.url, this.toPayload(usuario)).pipe(map((result) => ({ usuario: this.toView(result.usuario), temporaryPassword: result.temporaryPassword })));
  }
  update(usuario: Usuario): Observable<Usuario> {
    return this.http.patch<ApiUsuario>(`${this.url}/${usuario.id}`, this.toPayload(usuario)).pipe(map((item) => this.toView(item)));
  }
  setStatus(id: string, estado: Usuario['estado']): Observable<Usuario> { return this.http.patch<ApiUsuario>(`${this.url}/${id}/estado`, { estado: estado.toUpperCase() }).pipe(map((item) => this.toView(item))); }
  resetPassword(id: string): Observable<{ temporaryPassword: string }> { return this.http.post<{ temporaryPassword: string }>(`${this.url}/${id}/restablecer-password`, {}); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
  private toPayload(usuario: Usuario) { return { nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol, estado: usuario.estado.toUpperCase() }; }
  private toView(item: ApiUsuario): Usuario {
    return { id: item.id, nombre: item.nombre, correo: item.correo, rol: item.rol.codigo, estado: item.estado.toLowerCase() as Usuario['estado'], ultimoAcceso: item.ultimoAccesoAt ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.ultimoAccesoAt)) : 'Sin accesos' };
  }
}
