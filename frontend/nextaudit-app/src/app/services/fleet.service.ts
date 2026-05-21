import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, forkJoin, map, of, throwError } from 'rxjs';

export interface FleetHost {
  id: number;
  display_name: string;
  hostname: string;
  platform: string;
  os_version: string;
  status: 'online' | 'offline' | string;
  last_enrolled_at: string;
  issues?: {
    critical_vulnerabilities_count?: number;
  };
}

export interface FleetVulnerability {
  cve: string;
  hosts_count: number;
  details_link?: string;
}

type FleetCollectionResponse<T> = T[] | { hosts?: T[]; vulnerabilities?: T[]; data?: T[] | { items?: T[] } };

export interface FleetLoginRequest {
  email: string;
  password: string;
}

export interface DeviceRow {
  id: number;
  name: string;
  os: string;
  osFamily: 'windows' | 'ubuntu' | 'linux' | 'mac' | 'other';
  status: 'Protegido' | 'Riesgo' | 'Offline';
  auditDate: string;
  hostname: string;
  platform: string;
  enrolledAt: string;
  criticalVulnerabilities: number;
}

@Injectable({ providedIn: 'root' })
export class FleetService {
  private readonly base = '/api/v1/fleet';

  readonly hosts = signal<FleetHost[]>([]);
  readonly vulnerabilities = signal<FleetVulnerability[]>([]);
  readonly isOffline = signal(false);
  readonly loading = signal(true);
  readonly authLoading = signal(false);
  readonly authError = signal<string | null>(null);
  readonly dataError = signal<string | null>(null);

  readonly totalHosts = computed(() => this.hosts().length);
  readonly onlineHosts = computed(() => this.hosts().filter((h) => h.status === 'online').length);
  readonly fleetHealth = computed(() => {
    const total = this.totalHosts();
    return total === 0 ? 0 : Math.round((this.onlineHosts() / total) * 100);
  });
  readonly vulnerabilityCount = computed(() => this.vulnerabilities().length);
  readonly isAuthenticated = computed(() => true);

  readonly deviceRows = computed<DeviceRow[]>(() =>
    this.hosts().map((host) => ({
      id: host.id,
      name: host.display_name || host.hostname || `Host-${host.id}`,
      os: host.os_version || host.platform || 'Sin dato',
      osFamily: this.mapOsFamily(host.platform, host.os_version),
      status: this.mapStatus(host),
      auditDate: this.toRelativeTime(host.last_enrolled_at),
      hostname: host.hostname || 'Sin dato',
      platform: host.platform || 'Sin dato',
      enrolledAt: this.formatDate(host.last_enrolled_at),
      criticalVulnerabilities: host.issues?.critical_vulnerabilities_count ?? 0,
    })),
  );

  readonly currentAuditAlert = signal<any | null>(null);
  readonly auditHistory = signal<any[]>([]);

  constructor(private readonly http: HttpClient) {
    this.refresh();
  }

  login(_credentials: FleetLoginRequest) {
    this.authLoading.set(true);
    this.authError.set(null);

    this.refresh();
    this.authLoading.set(false);

    return of('backend-managed');
  }

  logout() {
    this.hosts.set([]);
    this.vulnerabilities.set([]);
    this.authError.set(null);
    this.dataError.set(null);
    this.isOffline.set(false);
  }

  getHosts() {
    return this.http
      .get<FleetCollectionResponse<FleetHost>>(`${this.base}/hosts`)
      .pipe(
        map((response) => this.normalizeFleetCollection(response, 'hosts')),
        catchError((error: unknown) =>
          throwError(() => this.parseError(error, 'No fue posible cargar los dispositivos.')),
        ),
      );
  }

  getVulnerabilities() {
    return this.http
      .get<FleetCollectionResponse<FleetVulnerability>>(`${this.base}/vulnerabilities`)
      .pipe(
        map((response) => this.normalizeFleetCollection(response, 'vulnerabilities')),
        catchError((error: unknown) =>
          throwError(() => this.parseError(error, 'No fue posible cargar las vulnerabilidades.')),
        ),
      );
  }

  refresh() {
    this.loading.set(true);
    this.dataError.set(null);

    forkJoin({
      hosts: this.getHosts().pipe(
        map((data) => ({ data, ok: true })),
        catchError(() => of({ data: [] as FleetHost[], ok: false })),
      ),
      vulnerabilities: this.getVulnerabilities().pipe(
        map((data) => ({ data, ok: true })),
        catchError(() => of({ data: [] as FleetVulnerability[], ok: false })),
      ),
    }).subscribe(({ hosts, vulnerabilities }) => {
      this.hosts.set(hosts.data);
      this.vulnerabilities.set(vulnerabilities.data);
      this.isOffline.set(!hosts.ok);
      if (!hosts.ok || !vulnerabilities.ok) {
        this.dataError.set('La plataforma respondio con errores parciales. Revisa la conexion o la sesion.');
      }
      this.loading.set(false);
    });
  }

  private mapStatus(host: FleetHost): DeviceRow['status'] {
    if (host.status === 'offline') return 'Offline';
    return (host.issues?.critical_vulnerabilities_count ?? 0) > 0 ? 'Riesgo' : 'Protegido';
  }

  private normalizeFleetCollection<T>(
    response: FleetCollectionResponse<T>,
    key: 'hosts' | 'vulnerabilities',
  ): T[] {
    if (Array.isArray(response)) return response;

    const direct = response[key];
    if (Array.isArray(direct)) return direct;

    if (Array.isArray(response.data)) return response.data;
    if (response.data && !Array.isArray(response.data) && Array.isArray(response.data.items)) {
      return response.data.items;
    }

    return [];
  }

  private mapOsFamily(platform: string, osVersion: string): DeviceRow['osFamily'] {
    const raw = `${platform} ${osVersion}`.toLowerCase();
    if (raw.includes('win')) return 'windows';
    if (raw.includes('ubuntu')) return 'ubuntu';
    if (raw.includes('linux')) return 'linux';
    if (raw.includes('darwin') || raw.includes('mac') || raw.includes('os x')) return 'mac';
    return 'other';
  }

  private toRelativeTime(input: string): string {
    if (!input) return 'Sin fecha';

    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return 'Sin fecha';

    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60_000);
    if (diffMinutes < 1) return 'Hace 1m';
    if (diffMinutes < 60) return `Hace ${diffMinutes}m`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
  }

  private formatDate(input: string): string {
    if (!input) return 'Sin fecha';

    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return 'Sin fecha';

    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  private parseError(error: unknown, fallbackMessage: string): Error {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        this.logout();
      }

      const apiMessage =
        typeof error.error === 'string'
          ? error.error
          : (error.error as { message?: string } | null)?.message;
      const message = apiMessage?.trim()
        ? apiMessage
        : `${fallbackMessage} (HTTP ${error.status || '0'})`;
      return new Error(message);
    }

    if (error instanceof Error && error.message.trim().length > 0) {
      return error;
    }

    return new Error(fallbackMessage);
  }
}
