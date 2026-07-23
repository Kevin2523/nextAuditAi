import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface SecurityDemoStatus {
  waf: {
    rulesCount: number;
    recentBlocks: number;
    lastBlocked: string | null;
    status: string;
  };
  ids: {
    trackedIps: number;
    blockedIps: number;
    status: string;
  };
  fim: {
    monitoredFiles: number;
    integrityStatus: string;
    lastCheck: string | null;
    files: Array<{ file: string; hash: string; lastChecked: string }>;
  };
  rateLimiting: {
    short: { ttl: string; limit: number };
    medium: { ttl: string; limit: number };
    long: { ttl: string; limit: number };
  };
  helmet: {
    csp: boolean;
    hsts: boolean;
    xframe: string;
  };
  recentEvents: Array<{
    event: string;
    severity: string;
    ip: string | null;
    email: string | null;
    userId: string | null;
    details: Record<string, unknown> | null;
    timestamp: string;
  }>;
}

@Injectable({ providedIn: 'root' })
export class SecurityDemoService {
  private readonly endpoint = '/api/v1/security/demo/status';

  constructor(private readonly http: HttpClient) {}

  async getStatus(): Promise<SecurityDemoStatus> {
    return firstValueFrom(this.http.get<SecurityDemoStatus>(this.endpoint));
  }

  async executeCommand(command: string): Promise<{ output: string }> {
    return firstValueFrom(this.http.post<{ output: string }>('/api/v1/security/demo/command', { command }));
  }
}
