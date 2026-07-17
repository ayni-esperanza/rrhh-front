import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly isDarkModeSignal = signal<boolean>(this.getInitialTheme());
  readonly isDarkMode = computed(() => this.isDarkModeSignal());

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    effect(() => {
      const isDark = this.isDarkModeSignal();
      this.applyTheme(isDark);
      this.saveTheme(isDark);
    });

    this.listenToSystemPreference();
  }

  toggleTheme(): void {
    this.isDarkModeSignal.update((current) => !current);
  }

  setTheme(isDark: boolean): void {
    this.isDarkModeSignal.set(isDark);
  }

  private getInitialTheme(): boolean {
    if (!this.isBrowser) {
      return false;
    }

    const savedTheme = localStorage.getItem(STORAGE_KEY);

    if (savedTheme === 'dark') return true;
    if (savedTheme === 'light') return false;

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(isDark: boolean): void {
    const html = this.document.documentElement;
    const body = this.document.body;

    html.classList.toggle('dark', isDark);
    body?.classList.toggle('dark', isDark);
  }

  private saveTheme(isDark: boolean): void {
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  }

  private listenToSystemPreference(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem(STORAGE_KEY);

      if (!savedTheme) {
        this.isDarkModeSignal.set(event.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    this.destroyRef.onDestroy(() => {
      mediaQuery.removeEventListener('change', handleChange);
    });
  }
}
