import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
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
  { label: 'Usuarios', route: '/usuarios', icon: 'userCog', permission: 'usuarios:manage' }
];

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
  protected readonly isCollapsed = signal(false);
  protected readonly isAlertsOpen = signal(false);
  protected readonly isUserMenuOpen = signal(false);
  protected readonly isMobileMenuOpen = signal(false);
  protected readonly visibleNavigation = computed(() => NAVIGATION.filter((item) => !item.permission || this.authService.hasPermission(item.permission)));
  protected readonly primaryMobileNavigation = computed(() => this.visibleNavigation().slice(0, 3));
  protected readonly overflowMobileNavigation = computed(() => this.visibleNavigation().slice(3));

  protected icon(name: FlowbiteIconName) {
    return FLOWBITE_ICONS[name];
  }

  protected themeIcon(): FlowbiteIconName {
    return this.themeService.isDarkMode() ? 'sun' : 'moon';
  }

  @HostListener('document:click', ['$event'])
  protected closePopupsOnOutsideClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.closeMenus();
    }
  }

  protected toggleCollapsed(): void {
    this.isCollapsed.update((current) => !current);
  }

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  protected toggleAlerts(): void {
    this.isAlertsOpen.update((current) => !current);
    this.isUserMenuOpen.set(false);
  }

  protected toggleUserMenu(): void {
    this.isUserMenuOpen.update((current) => !current);
    this.isAlertsOpen.set(false);
  }

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((current) => !current);
    this.isAlertsOpen.set(false);
    this.isUserMenuOpen.set(false);
  }
  protected closeMenus(): void {
    this.isAlertsOpen.set(false);
    this.isUserMenuOpen.set(false);
  }

  protected logout(): void {
    this.closeMenus();
    this.authService.logout();
  }
}