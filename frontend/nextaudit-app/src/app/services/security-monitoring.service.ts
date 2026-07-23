import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface WafRule {
  name: string;
  attack: string;
  severity: string;
  locations: string[];
  pattern: string;
  enabled: boolean;
}

export interface WafStats {
  rulesCount: number;
  totalBlocks: number;
  lastBlocked: string | null;
}

export interface IdsSignature {
  name: string;
  description: string;
  severity: string;
  action: string;
}

export interface IdsSignaturesResponse {
  signatures: IdsSignature[];
  thresholds: {
    max404PerIp: number;
    maxFailedLoginPerIp: number;
    maxRequestsPerIp: number;
    windowMs: number;
    blockDurationMs: number;
    maxPayloadSize: number;
  };
}

export interface IdsStats {
  trackedIps: number;
  blockedIps: number;
}

export interface SecurityLogEntry {
  id: string;
  event: string;
  severity: string;
  ip: string | null;
  email: string | null;
  userId: string | null;
  details: Record<string, unknown> | null;
  timestamp: string;
}

export interface LogsResponse {
  logs: SecurityLogEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface SummaryResponse {
  totalEvents: number;
  byEvent: Array<{ event: string; count: number }>;
  bySeverity: Array<{ severity: string; count: number }>;
  todayCount: number;
}

export interface WafTestResult {
  blocked: boolean;
  reason: string | null;
  rule: string | null;
  severity: string | null;
}

@Injectable({ providedIn: 'root' })
export class SecurityMonitoringService {
  constructor(private readonly http: HttpClient) {}

  getWafRules(): Promise<WafRule[]> {
    return firstValueFrom(this.http.get<WafRule[]>('/api/v1/security/waf/rules'));
  }

  getWafStats(): Promise<WafStats> {
    return firstValueFrom(this.http.get<WafStats>('/api/v1/security/waf/stats'));
  }

  getIdsSignatures(): Promise<IdsSignaturesResponse> {
    return firstValueFrom(this.http.get<IdsSignaturesResponse>('/api/v1/security/ids/signatures'));
  }

  getIdsStats(): Promise<IdsStats> {
    return firstValueFrom(this.http.get<IdsStats>('/api/v1/security/ids/stats'));
  }

  getLogs(params?: {
    event?: string;
    severity?: string;
    ip?: string;
    email?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<LogsResponse> {
    const query: Record<string, string | number> = {};
    if (params?.event) query['event'] = params.event;
    if (params?.severity) query['severity'] = params.severity;
    if (params?.ip) query['ip'] = params.ip;
    if (params?.email) query['email'] = params.email;
    if (params?.startDate) query['startDate'] = params.startDate;
    if (params?.endDate) query['endDate'] = params.endDate;
    if (params?.limit) query['limit'] = params.limit;
    if (params?.offset) query['offset'] = params.offset;
    return firstValueFrom(this.http.get<LogsResponse>('/api/v1/security/logs', { params: query as any }));
  }

  getSummary(): Promise<SummaryResponse> {
    return firstValueFrom(this.http.get<SummaryResponse>('/api/v1/security/summary'));
  }

  testWafPayload(payload: string): Promise<WafTestResult> {
    return firstValueFrom(this.http.post<WafTestResult>('/api/v1/security/waf/test', { payload }));
  }
}
