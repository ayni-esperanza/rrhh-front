import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthState, LoginCredentials, UserSession } from '../models/auth.models';
import { TokenStorageService } from './token-storage.service';

const DEMO_USERS: Record<string, UserSession & { password: string }> = {
  'admin@rrhh.com': {
    id: '1',
    name: 'Administrador RR.HH.',
    email: 'admin@rrhh.com',
    password: 'admin123',
    role: 'admin',
    permissions: ['dashboard:view', 'colaboradores:manage', 'asistencias:manage', 'pagos:manage', 'reportes:view', 'alertas:view']
  },
  'supervisor@rrhh.com': {
    id: '2',
    name: 'Supervisor',
    email: 'supervisor@rrhh.com',
    password: 'supervisor123',
    role: 'supervisor',
    permissions: ['dashboard:view', 'asistencias:view', 'alertas:view']
  }
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly state = signal<AuthState>(this.tokenStorage.getState());
  private logoutInProgress = false;

  readonly user = computed(() => this.state().user);
  readonly token = computed(() => this.state().token);
  readonly isAuthenticated = computed(() => Boolean(this.state().token && this.state().user));

  login(credentials: LoginCredentials): boolean {
    const foundUser = DEMO_USERS[credentials.email.trim().toLowerCase()];

    if (!foundUser || foundUser.password !== credentials.password) {
      return false;
    }

    const { password: _password, ...user } = foundUser;
    const nextState: AuthState = {
      token: `demo-token-${user.id}`,
      user
    };

    this.state.set(nextState);
    this.tokenStorage.saveState(nextState);
    return true;
  }

  logout(): void {
    if (this.logoutInProgress) {
      return;
    }

    this.logoutInProgress = true;
    this.clearSession();

    void this.router.navigate(['/loading'], {
      queryParams: { next: '/auth/login', source: 'logout' },
      replaceUrl: true
    }).finally(() => {
      setTimeout(() => {
        this.logoutInProgress = false;
      }, 1500);
    });
  }

  getLandingRoute(): string {
    if (this.hasPermission('dashboard:view')) return '/dashboard';
    if (this.hasPermission('colaboradores:manage')) return '/colaboradores';
    if (this.hasPermission('asistencias:view')) return '/asistencias';
    if (this.hasPermission('pagos:manage')) return '/pagos';
    if (this.hasPermission('reportes:view')) return '/reportes';
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
    this.state.set({ token: null, user: null });
    this.tokenStorage.clear();
  }
}