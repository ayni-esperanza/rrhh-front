import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styleUrl: './app.css'
})
export class App {
  private readonly firstOpenLoaderKey = 'ayni-rrhh-first-open-loader-seen-v1';
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly themeService = inject(ThemeService);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    const initialUrl = this.getInitialUrl();

    if (this.shouldRouteThroughStartupLoader(initialUrl)) {
      void this.router.navigate(['/loading'], {
        queryParams: {
          next: this.getStartupLoaderNextUrl(initialUrl),
          source: 'startup'
        },
        replaceUrl: true
      });
    }
  }

  private shouldRouteThroughStartupLoader(url: string): boolean {
    if (!this.isBrowser) {
      return false;
    }

    const normalized = this.normalizeNextUrl(url);

    if (normalized.startsWith('/loading')) {
      return false;
    }

    try {
      const seen = localStorage.getItem(this.firstOpenLoaderKey) === '1';

      if (seen) {
        return false;
      }

      localStorage.setItem(this.firstOpenLoaderKey, '1');
      return true;
    } catch {
      return false;
    }
  }

  private getStartupLoaderNextUrl(url: string): string {
    if (!this.authService.isAuthenticated()) {
      return '/auth/login';
    }

    const normalized = this.normalizeNextUrl(url);

    if (normalized === '/' || normalized === '/auth/login') {
      return this.authService.getLandingRoute();
    }

    return normalized;
  }

  private getInitialUrl(): string {
    if (!this.isBrowser) {
      return this.router.url || '/';
    }

    return `${window.location.pathname}${window.location.search}${window.location.hash}` || '/';
  }

  private normalizeNextUrl(url: string): string {
    const normalized = (url || '/').trim();

    if (!normalized || !normalized.startsWith('/') || normalized.startsWith('//')) {
      return '/';
    }

    return normalized;
  }
}