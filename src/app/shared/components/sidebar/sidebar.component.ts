import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { FLOWBITE_ICONS, FlowbiteIconName } from '../../icons/flowbite-icons';
interface SidebarNavigationItem {
  label: string;
  route: string;
  icon: FlowbiteIconName;
  permission?: string;
}

const NAVIGATION: SidebarNavigationItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'dashboard', permission: 'dashboard:view' },
  { label: 'Colaboradores', route: '/colaboradores', icon: 'users', permission: 'colaboradores:manage' },
  { label: 'Asistencias', route: '/asistencias', icon: 'clock', permission: 'asistencias:view' },
  { label: 'Pagos', route: '/pagos', icon: 'wallet', permission: 'pagos:manage' },
  { label: 'Reportes', route: '/reportes', icon: 'chart', permission: 'reportes:view' },
  { label: 'Alertas', route: '/alertas', icon: 'bell', permission: 'alertas:view' }
];

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
  protected readonly isCollapsed = signal(false);
  protected readonly visibleNavigation = computed(() => NAVIGATION.filter((item) => !item.permission || this.authService.hasPermission(item.permission)));

  protected icon(name: FlowbiteIconName) {
    return FLOWBITE_ICONS[name];
  }

  protected themeIcon(): FlowbiteIconName {
    return this.themeService.isDarkMode() ? 'sun' : 'moon';
  }

  protected toggleCollapsed(): void {
    this.isCollapsed.update((current) => !current);
  }

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  protected logout(): void {
    this.authService.logout();
  }
}