import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { AuthState } from '../models/auth.models';

const TOKEN_KEY = 'rrhh_token';
const USER_KEY = 'rrhh_user';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  getState(): AuthState {
    if (!this.isBrowser) {
      return { token: null, user: null };
    }

    const token = localStorage.getItem(TOKEN_KEY);
    const rawUser = localStorage.getItem(USER_KEY);

    return {
      token,
      user: rawUser ? JSON.parse(rawUser) : null
    };
  }

  saveState(state: AuthState): void {
    if (!this.isBrowser) return;

    if (state.token) {
      localStorage.setItem(TOKEN_KEY, state.token);
    }

    if (state.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(state.user));
    }
  }

  clear(): void {
    if (!this.isBrowser) return;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}