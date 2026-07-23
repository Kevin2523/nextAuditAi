import { Injectable, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuditNotificationService } from './audit-notification.service';

interface WafStats {
  totalBlocks: number;
  lastBlocked: string | null;
}

interface SecurityLogEntry {
  id: string;
  event: string;
  details: { rule?: string; reason?: string; method?: string; path?: string };
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class WafNotificationService {
  private readonly http = inject(HttpClient);
  private readonly notifications = inject(AuditNotificationService);
  private lastTotal = -1;
  private polling = false;

  start(): void {
    if (this.polling) return;
    this.polling = true;
    this.poll();
  }

  stop(): void {
    this.polling = false;
  }

  private poll(): void {
    if (!this.polling) return;

    this.http.get<WafStats>('/api/v1/security/waf/stats').subscribe({
      next: (stats) => {
        if (this.lastTotal === -1) {
          this.lastTotal = stats.totalBlocks;
        } else if (stats.totalBlocks > this.lastTotal) {
          const diff = stats.totalBlocks - this.lastTotal;
          this.lastTotal = stats.totalBlocks;

          this.http.get<{ logs: SecurityLogEntry[] }>(
            `/api/v1/security/logs?event=WAF_BLOCKED&limit=${diff}`
          ).subscribe({
            next: (res) => {
              for (const log of res.logs) {
                const rule = log.details?.rule ?? 'desconocida';
                const path = log.details?.path ?? '/';
                this.notifications.pushOnce({
                  key: `waf-block-${log.id}`,
                  title: 'WAF bloqueo',
                  message: `Buen intento crack - ${rule} bloqueado en ${path}`,
                  source: 'activity',
                  severity: 'warning',
                });
              }
            },
          });
        }
      },
    });

    setTimeout(() => this.poll(), 5000);
  }
}
