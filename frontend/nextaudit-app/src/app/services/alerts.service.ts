import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of, shareReplay, switchMap, tap, timer } from 'rxjs';

export type AlertSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'dismissed';

export interface NextAuditAlert {
  id: string;
  tenantId: string;
  source: string;
  deviceId?: string | null;
  hostname?: string | null;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  occurredAt: string;
  receivedAt: string;
  raw?: unknown;
}

@Injectable({ providedIn: 'root' })
export class AlertsService {
  private readonly endpoint = '/api/v1/alerts?limit=20';
  private readonly pollMs = 10_000;

  readonly alerts = signal<NextAuditAlert[]>([]);
  readonly loading = signal(true);
  readonly isOffline = signal(false);

  readonly alerts$ = timer(0, this.pollMs).pipe(
    switchMap(() =>
      this.http.get<{ alerts: NextAuditAlert[] }>(this.endpoint).pipe(
        map((response) => ({ alerts: response.alerts, offline: false })),
        catchError(() => of({ alerts: [] as NextAuditAlert[], offline: true })),
      ),
    ),
    tap(({ alerts, offline }) => {
      this.alerts.set(alerts);
      this.isOffline.set(offline);
      this.loading.set(false);
    }),
    map(({ alerts }) => alerts),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  constructor(private readonly http: HttpClient) {
    this.alerts$.subscribe();
  }
}
