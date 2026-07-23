import { Injectable } from '@nestjs/common';
import { SecurityEvent, SecurityLoggerService } from '../logger/security-logger.service';
import {
  IDS_SIGNATURES,
  MAX_404_PER_IP,
  MAX_FAILED_LOGIN_PER_IP,
  MAX_REQUESTS_PER_IP,
  WINDOW_MS,
  BLOCK_DURATION_MS,
  MAX_PAYLOAD_SIZE,
} from './ids-signatures';

interface IpRecord {
  requestCount: number;
  failedLogins: number;
  notFoundCount: number;
  windowStart: number;
  blockedUntil: number;
}

@Injectable()
export class IdsService {
  private readonly ipMap = new Map<string, IpRecord>();
  private readonly cleanupInterval: ReturnType<typeof setInterval>;

  constructor(private readonly securityLogger: SecurityLoggerService) {
    this.cleanupInterval = setInterval(() => this.cleanup(), WINDOW_MS * 5);
  }

  inspectRequest(
    ip: string,
    statusCode: number,
    userAgent?: string,
    bodySize?: number,
  ): { blocked: boolean; reason?: string } {
    const now = Date.now();
    let record = this.ipMap.get(ip);

    if (!record || now - record.windowStart > WINDOW_MS) {
      record = { requestCount: 0, failedLogins: 0, notFoundCount: 0, windowStart: now, blockedUntil: 0 };
      this.ipMap.set(ip, record);
    }

    if (record.blockedUntil > now) {
      return { blocked: true, reason: 'IP bloqueada temporalmente por actividad sospechosa.' };
    }

    record.requestCount++;

    if (statusCode === 404) {
      record.notFoundCount++;
      if (record.notFoundCount >= MAX_404_PER_IP) {
        this.blockIp(ip, record, 'PATH_SCANNING');
        return { blocked: true, reason: 'IP bloqueada por escaneo de rutas.' };
      }
    }

    if (record.requestCount >= MAX_REQUESTS_PER_IP) {
      this.blockIp(ip, record, 'RATE_ABUSE');
      return { blocked: true, reason: 'IP bloqueada por exceso de requests.' };
    }

    if (bodySize && bodySize > MAX_PAYLOAD_SIZE) {
      this.securityLogger.recordSecurityEvent(SecurityEvent.IDS_DETECTED, {
        ip,
        details: { signature: 'PAYLOAD_ANOMALY', bodySize },
      });
    }

    return { blocked: false };
  }

  recordFailedLogin(ip: string): void {
    const now = Date.now();
    let record = this.ipMap.get(ip);

    if (!record || now - record.windowStart > WINDOW_MS) {
      record = { requestCount: 0, failedLogins: 0, notFoundCount: 0, windowStart: now, blockedUntil: 0 };
      this.ipMap.set(ip, record);
    }

    record.failedLogins++;

    if (record.failedLogins >= MAX_FAILED_LOGIN_PER_IP) {
      this.blockIp(ip, record, 'BRUTE_FORCE');
    }
  }

  isIpBlocked(ip: string): boolean {
    const record = this.ipMap.get(ip);
    return record ? record.blockedUntil > Date.now() : false;
  }

  getTrackedIpCount(): number {
    return this.ipMap.size;
  }

  getBlockedIpCount(): number {
    const now = Date.now();
    let count = 0;
    for (const record of this.ipMap.values()) {
      if (record.blockedUntil > now) count++;
    }
    return count;
  }

  private blockIp(ip: string, record: IpRecord, signatureName: string): void {
    record.blockedUntil = Date.now() + BLOCK_DURATION_MS;

    this.securityLogger.recordSecurityEvent(SecurityEvent.IDS_DETECTED, {
      ip,
      details: {
        signature: signatureName,
        description: IDS_SIGNATURES[signatureName]?.description,
        blockedUntil: new Date(record.blockedUntil).toISOString(),
      },
    });
  }

  cleanup(): void {
    const now = Date.now();
    for (const [ip, record] of this.ipMap.entries()) {
      if (now - record.windowStart > WINDOW_MS * 10 && record.blockedUntil < now) {
        this.ipMap.delete(ip);
      }
    }
  }
}
