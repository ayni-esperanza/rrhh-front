import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { authTokenInterceptor } from './core/interceptors/auth-token.interceptor';
import { AuthorizedPreloadingStrategy } from './core/routing/authorized-preloading.strategy';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // ngx-charts reposiciona sus tooltips de forma asíncrona y necesita que
    // Angular programe una nueva detección después de ese cambio.
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideRouter(routes, withComponentInputBinding(), withPreloading(AuthorizedPreloadingStrategy)),
    provideHttpClient(withInterceptors([authTokenInterceptor]))
  ]
};
