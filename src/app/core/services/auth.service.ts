import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, of, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, AuthState, LoginCredentials } from '../models/auth.models';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly state = signal<AuthState>(this.tokenStorage.getState());
  private logoutInProgress = false;
  private refreshRequest$: Observable<string> | null = null;

  readonly user = computed(() => this.state().user);
  readonly token = computed(() => this.state().token);
  readonly isAuthenticated = computed(() => Boolean(this.state().token && this.state().user));

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => this.setSession(response))
    );
  }

  forgotPassword(email: string): Observable<{ message: string; resetToken?: string }> {
    return this.http.post<{ message: string; resetToken?: string }>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  refreshSession(): Observable<string> {
    if (this.refreshRequest$) return this.refreshRequest$;

    const refreshToken = this.state().refreshToken;
    if (!refreshToken) return throwError(() => new Error('No hay token de renovación'));

    this.refreshRequest$ = this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap((response) => this.setSession(response)),
      map((response) => response.accessToken),
      finalize(() => this.refreshRequest$ = null),
      shareReplay({ bufferSize: 1, refCount: false })
    );
    return this.refreshRequest$;
  }

  validAccessToken(): Observable<string> {
    const currentToken = this.state().token;
    if (currentToken && !this.tokenStorage.isTokenExpiring(currentToken)) return of(currentToken);
    return this.refreshSession();
  }

  getCurrentUser(): Observable<AuthResponse['user']> {
    return this.http.get<AuthResponse['user']>(`${environment.apiUrl}/auth/me`).pipe(
      tap((user) => {
        const current = this.state();
        const nextState = { ...current, user };
        this.state.set(nextState);
        this.tokenStorage.saveState(nextState);
      })
    );
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/reset-password`, { token, newPassword });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/change-password`, { currentPassword, newPassword });
  }

  logout(): void {
    if (this.logoutInProgress) {
      return;
    }

    this.logoutInProgress = true;
    this.http.post<void>(`${environment.apiUrl}/auth/logout`, {}).pipe(
      catchError(() => of(undefined))
    ).subscribe(() => this.finishLogout());
  }

  handleUnauthorized(): void {
    if (!this.isAuthenticated()) return;

    this.clearSession();
    void this.router.navigate(['/auth/login'], {
      queryParams: { reason: 'session-expired' },
      replaceUrl: true
    });
  }

  getLandingRoute(): string {
    if (this.hasPermission('dashboard:view')) return '/dashboard';
    if (this.hasPermission('colaboradores:manage')) return '/colaboradores';
    if (this.hasPermission('asistencias:view')) return '/asistencias';
    if (this.hasPermission('pagos:manage')) return '/pagos';
    if (this.hasPermission('usuarios:manage')) return '/usuarios';
    if (this.hasPermission('alertas:view')) return '/alertas';

    return '/auth/login';
  }

  hasPermission(permission: string): boolean {
    const user = this.user();
    return user?.role === 'admin' || Boolean(user?.permissions.includes(permission));
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.length === 0 || permissions.some((permission) => this.hasPermission(permission));
  }

  private clearSession(): void {
    this.state.set({ token: null, refreshToken: null, user: null });
    this.tokenStorage.clear();
  }

  private finishLogout(): void {
    this.clearSession();
    void this.router.navigate(['/loading'], {
      queryParams: { next: '/auth/login', source: 'logout' },
      replaceUrl: true
    }).finally(() => {
      setTimeout(() => this.logoutInProgress = false, 1500);
    });
  }

  private setSession(response: AuthResponse): void {
    const nextState: AuthState = { token: response.accessToken, refreshToken: response.refreshToken, user: response.user };
    this.state.set(nextState);
    this.tokenStorage.saveState(nextState);
  }
}
