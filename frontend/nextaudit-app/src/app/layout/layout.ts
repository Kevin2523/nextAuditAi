import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuditNotification, AuditNotificationService } from '../services/audit-notification.service';
import { ChatDrawerService } from '../services/chat-drawer.service';
import { Assistant } from '../features/assistant/assistant';
import { SettingsPanel } from '../features/settings/settings-panel';
import { AuthService, UserRole } from '../services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  section: string;
  roles?: UserRole[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, Assistant, SettingsPanel],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {
  protected readonly auditNotifications = inject(AuditNotificationService);
  protected readonly chatDrawer = inject(ChatDrawerService);
  protected readonly auth = inject(AuthService);
  collapsed = false;
  currentTitle = 'Dashboard';
  readonly globalQuery = signal('');
  readonly notificationsOpen = signal(false);
  readonly settingsOpen = signal(false);

  sections = ['MENU PRINCIPAL', 'ADMINISTRACION', 'CONFIGURACION Y AYUDA'];

  navItems: NavItem[] = [
    { label: 'Dashboard',             route: '/dashboard',     icon: 'layout-dashboard', section: 'MENU PRINCIPAL' },
    { label: 'Inventario de Dispositivos', route: '/inventory',     icon: 'laptop',           section: 'MENU PRINCIPAL' },
    { label: 'Registro de Actividad', route: '/history',       icon: 'activity',         section: 'MENU PRINCIPAL' },
    { label: 'Asistente Virtual',     route: '/assistant',     icon: 'bot',              section: 'MENU PRINCIPAL', roles: ['admin', 'super_admin'] },
    { label: 'Usuarios',              route: '/admin/users',   icon: 'users',            section: 'ADMINISTRACION', roles: ['super_admin'] },
    { label: 'Centro de Ayuda',       route: '/help-center',   icon: 'book',             section: 'CONFIGURACION Y AYUDA' },
  ];

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        const item = this.navItems.find(n => e.urlAfterRedirects.startsWith(n.route));
        if (item) this.currentTitle = item.label;
      });
  }

  getItemsBySection(section: string): NavItem[] {
    return this.navItems.filter(i => i.section === section && this.canShowItem(i));
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  updateGlobalQuery(event: Event) {
    const target = event.target as HTMLInputElement;
    this.globalQuery.set(target.value || '');
  }

  runGlobalSearch() {
    const query = this.globalQuery().trim();
    if (!query) return;

    this.router.navigate(['/inventory'], { queryParams: { q: query } });
  }

  toggleNotifications() {
    this.notificationsOpen.update((open) => !open);
  }

  toggleSettings() {
    this.settingsOpen.update((open) => !open);
  }

  openNotification(notification: AuditNotification) {
    this.auditNotifications.markAsRead(notification.id);
    this.notificationsOpen.set(false);

    if (notification.source === 'fleet') {
      this.router.navigate(['/inventory']);
      return;
    }

    if (notification.source === 'ai') {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.router.navigate(['/history']);
  }

  markNotificationsRead() {
    this.auditNotifications.markAllAsRead();
  }

  enableSystemNotifications() {
    this.auditNotifications.requestSystemPermission();
  }

  private canShowItem(item: NavItem): boolean {
    return !item.roles || this.auth.hasAnyRole(item.roles);
  }
}
