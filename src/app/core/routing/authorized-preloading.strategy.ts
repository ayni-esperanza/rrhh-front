import { Injectable, Injector, inject } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthorizedPreloadingStrategy implements PreloadingStrategy {
  private readonly injector = inject(Injector);

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    const permissions = (route.data?.['permissions'] as string[] | undefined) ?? [];
    if (!permissions.length) return load();

    const authService = this.injector.get(AuthService);
    return authService.isAuthenticated() && authService.hasAnyPermission(permissions) ? load() : of(null);
  }
}
