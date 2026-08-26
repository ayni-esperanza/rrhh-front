import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { AuthState } from '../models/auth.models';

const TOKEN_KEY = 'rrhh_token';
const REFRESH_TOKEN_KEY = 'rrhh_refresh_token';
const USER_KEY = 'rrhh_user';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  getState(): AuthState {
    if (!this.isBrowser) {
      return this.emptyState();
    }

    const token = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const rawUser = localStorage.getItem(USER_KEY);

    try {
      const user = rawUser ? JSON.parse(rawUser) : null;

      // La versión de demostración guardaba valores como "demo-token-1" bajo
      // la misma clave. No deben considerarse sesiones válidas tras migrar a JWT.
      if (!this.isJwt(token) || !this.isJwt(refreshToken) || !this.isTokenActive(refreshToken) || !user) {
        this.clear();
        return this.emptyState();
      }

      return {
        token,
        refreshToken,
        user
      };
    } catch {
      this.clear();
      return this.emptyState();
    }
  }

  saveState(state: AuthState): void {
    if (!this.isBrowser) return;

    if (state.token) {
      localStorage.setItem(TOKEN_KEY, state.token);
    }
    if (state.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, state.refreshToken);

    if (state.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(state.user));
    }
  }

  clear(): void {
    if (!this.isBrowser) return;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  isTokenExpiring(token: string | null, withinSeconds = 30): boolean {
    const expiration = this.tokenExpiration(token);
    return expiration === null || expiration <= Date.now() + withinSeconds * 1000;
  }

  private emptyState(): AuthState {
    return { token: null, refreshToken: null, user: null };
  }

  private isJwt(token: string | null): token is string {
    if (!token) return false;

    const parts = token.split('.');
    if (parts.length !== 3) return false;

    try {
      return this.tokenExpiration(token) !== null;
    } catch {
      return false;
    }
  }

  private isTokenActive(token: string | null): boolean {
    const expiration = this.tokenExpiration(token);
    return expiration !== null && expiration > Date.now();
  }

  private tokenExpiration(token: string | null): number | null {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const payload = JSON.parse(atob(padded)) as { exp?: number };
      return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }
}
