import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  catchError,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
  timer,
} from 'rxjs';

export interface N8nExecution {
  id: string;
  status?: string;
  startedAt?: string;
  stoppedAt?: string;
  workflowData?: {
    name?: string;
  };
  workflowName?: string;
  tipo_suceso?: string;
  dispositivo_afectado?: string;
  estado_resolucion?: 'exitoso' | 'fallido';
  finished?: boolean;
  data?: unknown;
}

export interface ActivityLog {
  id: string;
  tipo_suceso: string;
  dispositivo_afectado: string;
  occurredAt: string;
  timestamp: string;
  relativeTime: string;
  estado_resolucion: 'exitoso' | 'fallido';
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private readonly pollMs = 20_000;
  private readonly executionEndpoint = '/api/v1/activity/executions?limit=20';

  readonly logs = signal<ActivityLog[]>([]);
  readonly isOffline = signal(false);
  readonly loading = signal(true);

  readonly logs$: Observable<ActivityLog[]> = timer(0, this.pollMs).pipe(
    switchMap(() =>
      this.fetchExecutions().pipe(
        map((executions) => ({ executions, offline: false })),
        catchError(() => of({ executions: [] as N8nExecution[], offline: true })),
      ),
    ),
    map(({ executions, offline }) => ({
      logs: executions.map((item) => this.mapExecution(item)),
      offline,
    })),
    tap(({ logs, offline }) => {
      this.logs.set(logs);
      this.loading.set(false);
      this.isOffline.set(offline);
    }),
    map(({ logs }) => logs),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly autoHealingFeed$ = this.logs$.pipe(
    map((logs) => logs.filter((log) => this.isAutoHealing(log.tipo_suceso))),
    distinctUntilChanged((prev, current) => this.sameFeed(prev, current)),
  );

  constructor(private readonly http: HttpClient) {
    this.logs$.subscribe();
  }

  private fetchExecutions(): Observable<N8nExecution[]> {
    return this.http.get<unknown>(this.executionEndpoint).pipe(
      map((response) => this.normalizeExecutions(response)),
      catchError((error: unknown) => throwError(() => error)),
    );
  }

  private normalizeExecutions(payload: unknown): N8nExecution[] {
    if (Array.isArray(payload)) {
      return payload as N8nExecution[];
    }

    if (!payload || typeof payload !== 'object') {
      return [];
    }

    const record = payload as Record<string, unknown>;
    if (Array.isArray(record['executions'])) {
      return record['executions'] as N8nExecution[];
    }

    if (Array.isArray(record['data'])) {
      return record['data'] as N8nExecution[];
    }

    if (Array.isArray(record['results'])) {
      return record['results'] as N8nExecution[];
    }

    const data = record['data'];
    if (data && typeof data === 'object') {
      const dataRecord = data as Record<string, unknown>;
      if (Array.isArray(dataRecord['executions'])) {
        return dataRecord['executions'] as N8nExecution[];
      }

      if (Array.isArray(dataRecord['results'])) {
        return dataRecord['results'] as N8nExecution[];
      }
    }

    return [];
  }

  private mapExecution(execution: N8nExecution): ActivityLog {
    const eventDate = execution.startedAt ? new Date(execution.startedAt) : new Date();
    const normalizedStatus = execution.status?.toLowerCase();
    const status =
      execution.estado_resolucion ??
      (normalizedStatus === 'success' || (execution.finished === true && normalizedStatus !== 'error')
        ? 'exitoso'
        : 'fallido');

    return {
      id: execution.id || `${eventDate.getTime()}-${Math.random().toString(16).slice(2)}`,
      tipo_suceso: execution.tipo_suceso || execution.workflowData?.name || execution.workflowName || 'Auto-healing',
      dispositivo_afectado: execution.dispositivo_afectado || 'Dispositivo no identificado',
      occurredAt: eventDate.toISOString(),
      timestamp: this.formatAbsoluteDate(eventDate),
      relativeTime: this.toRelativeTime(eventDate),
      estado_resolucion: status,
    };
  }

  private formatAbsoluteDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  private toRelativeTime(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60_000);

    if (diffMinutes < 1) return 'Hace 1m';
    if (diffMinutes < 60) return `Hace ${diffMinutes}m`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
  }

  private isAutoHealing(eventType: string): boolean {
    const normalized = eventType.toLowerCase();
    return (
      normalized.includes('auto-healing') ||
      normalized.includes('auto healing') ||
      normalized.includes('autosanacion') ||
      normalized.includes('autocuracion')
    );
  }

  private sameFeed(previous: ActivityLog[], current: ActivityLog[]): boolean {
    if (previous.length !== current.length) return false;
    return previous.every((item, index) => item.id === current[index]?.id);
  }
}
