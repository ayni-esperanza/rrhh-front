import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../core/models/api.models';
export type CatalogType = 'areas' | 'cargos' | 'jornadas';
@Injectable({ providedIn: 'root' })
export class CatalogosService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/catalogos`;
  private readonly listCache = new Map<CatalogType, Observable<unknown[]>>();

  list<T>(type: CatalogType): Observable<T[]> {
    const cached = this.listCache.get(type);
    if (cached) return cached as Observable<T[]>;

    const request$ = this.http.get<PaginatedResponse<T>>(`${this.url}/${type}`, { params: { page: 1, limit: 100 } }).pipe(
      map((response) => response.data),
      catchError((error: unknown) => {
        this.listCache.delete(type);
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
    this.listCache.set(type, request$ as Observable<unknown[]>);
    return request$;
  }

  create<T>(type: CatalogType, value: unknown): Observable<T> {
    return this.http.post<T>(`${this.url}/${type}`, value).pipe(tap(() => this.invalidate(type)));
  }

  update<T>(type: CatalogType, id: string, value: unknown): Observable<T> {
    return this.http.patch<T>(`${this.url}/${type}/${id}`, value).pipe(tap(() => this.invalidate(type)));
  }

  deactivate(type: CatalogType, id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${type}/${id}`).pipe(tap(() => this.invalidate(type)));
  }

  invalidate(type?: CatalogType): void {
    if (type) this.listCache.delete(type);
    else this.listCache.clear();
  }
}
