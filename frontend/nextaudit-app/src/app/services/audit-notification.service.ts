import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ActivityService } from './activity.service';
import { FleetService } from './fleet.service';

export type AuditNotificationSource = 'fleet' | 'activity' | 'ai';
export type AuditNotificationSeverity = 'critical' | 'warning';

export interface AuditNotification {
  id: string;
  title: string;
  message: string;
  source: AuditNotificationSource;
  severity: AuditNotificationSeverity;
  createdAt: string;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuditNotificationService {
  private readonly fleet = inject(FleetService);
  private readonly activity = inject(ActivityService);
  private readonly knownKeys = new Set<string>();

  readonly notifications = signal<AuditNotification[]>([]);
  readonly systemPermission = signal<NotificationPermission>(this.readNotificationPermission());
  readonly unreadCount = computed(() => this.notifications().filter((item) => !item.read).length);
  readonly latestUnread = computed(() => this.notifications().find((item) => !item.read) ?? null);

  constructor() {
    effect(() => {
      const alert = this.fleet.currentAuditAlert();
      if (alert) {
        this.pushOnce({
          key: `n8n-alert-${alert.timestamp}-${alert.dispositivo}`,
          title: 'Alerta de IA Sentinel',
          message: alert.mensaje,
          source: 'ai',
          severity: alert.severidad === 'critical' ? 'critical' : 'warning',
        });
      }
    });
  }

  async requestSystemPermission() {
    if (!this.canUseSystemNotifications()) {
      return;
    }

    const permission = await Notification.requestPermission();
    this.systemPermission.set(permission);
  }

  markAsRead(id: string) {
    this.notifications.update((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }

  markAllAsRead() {
    this.notifications.update((items) => items.map((item) => ({ ...item, read: true })));
  }

  clearRead() {
    this.notifications.update((items) => items.filter((item) => !item.read));
  }

  private pushOnce(input: {
    key: string;
    title: string;
    message: string;
    source: AuditNotificationSource;
    severity: AuditNotificationSeverity;
  }) {
    if (this.knownKeys.has(input.key)) {
      return;
    }

    this.knownKeys.add(input.key);
    const notification: AuditNotification = {
      id: `${input.key}-${Date.now()}`,
      title: input.title,
      message: input.message,
      source: input.source,
      severity: input.severity,
      createdAt: new Date().toISOString(),
      read: false,
    };

    this.notifications.update((items) => [notification, ...items].slice(0, 30));
    this.sendSystemNotification(notification);
  }

  private sendSystemNotification(notification: AuditNotification) {
    if (!this.canUseSystemNotifications() || Notification.permission !== 'granted') {
      return;
    }

    new Notification(notification.title, {
      body: notification.message,
      tag: notification.id,
    });
  }

  private canUseSystemNotifications(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  private readNotificationPermission(): NotificationPermission {
    return this.canUseSystemNotifications() ? Notification.permission : 'denied';
  }
}
