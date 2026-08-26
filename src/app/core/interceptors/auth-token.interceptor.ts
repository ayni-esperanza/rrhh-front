import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const isPublicAuthRequest = ['/auth/login', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password']
    .some((path) => request.url.includes(path));

  if (isPublicAuthRequest) {
    return next(request);
  }

  if (!authService.isAuthenticated()) return next(request);

  const sendWithToken = (token: string) => next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));

  return authService.validAccessToken().pipe(
    catchError((refreshError: unknown) => {
      authService.handleUnauthorized();
      return throwError(() => refreshError);
    }),
    switchMap((token) => sendWithToken(token).pipe(
      catchError((error: unknown) => {
        if (!(error instanceof HttpErrorResponse) || error.status !== 401 || request.url.includes('/auth/')) {
          return throwError(() => error);
        }

        return authService.refreshSession().pipe(
          switchMap((newToken) => sendWithToken(newToken)),
          catchError((refreshError: unknown) => {
            authService.handleUnauthorized();
            return throwError(() => refreshError);
          })
        );
      })
    ))
  );
};
