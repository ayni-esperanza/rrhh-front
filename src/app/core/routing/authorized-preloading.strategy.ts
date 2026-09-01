import { Injectable, Injector, inject } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, switchMap, timer } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthorizedPreloadingStrategy implements PreloadingStrategy {
  private readonly injector = inject(Injector);
  private protectedRouteIndex = 0;

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    const permissions = (route.data?.['permissions'] as string[] | undefined) ?? [];
    if (!permissions.length) return load();

    const authService = this.injector.get(AuthService);
    if (!authService.isAuthenticated() || !authService.hasAnyPermission(permissions)) {
      return of(null);
    }

    // Angular solicita la precarga de todas las rutas lazy después de la
    // navegación inicial. Espaciarlas evita que la descarga y evaluación de
    // todos los módulos compita con los primeros clics del usuario.
    const delayMs = 1_200 + this.protectedRouteIndex++ * 450;

    return timer(delayMs).pipe(
      switchMap(() => {
        return authService.isAuthenticated() && authService.hasAnyPermission(permissions)
          ? load()
          : of(null);
      })
    );
  }
}
