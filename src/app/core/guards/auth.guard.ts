import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

function authorize(requiredPermissions: string[] = []): true | UrlTree {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  if (!authService.hasAnyPermission(requiredPermissions)) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
}

export const authGuard: CanActivateFn = (route) => authorize(route.data?.['permissions'] ?? []);
export const authMatchGuard: CanMatchFn = (route) => authorize(route.data?.['permissions'] ?? []);