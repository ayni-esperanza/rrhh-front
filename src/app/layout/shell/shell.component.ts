import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { NavigationItem } from '../../shared/models/navigation-item.model';

const NAVIGATION: NavigationItem[] = [
  { label: 'Dashboard', route: '/dashboard', permission: 'dashboard:view' },
  { label: 'Colaboradores', route: '/colaboradores', permission: 'colaboradores:manage' },
  { label: 'Asistencias', route: '/asistencias', permission: 'asistencias:view' },
  { label: 'Pagos', route: '/pagos', permission: 'pagos:manage' },
  { label: 'Reportes', route: '/reportes', permission: 'reportes:view' },
  { label: 'Alertas', route: '/alertas', permission: 'alertas:view' }
];

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.component.html'
})
export class ShellComponent {
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
  protected readonly visibleNavigation = computed(() => NAVIGATION.filter((item) => !item.permission || this.authService.hasPermission(item.permission)));

  protected logout(): void {
    this.authService.logout();
  }

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}