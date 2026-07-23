import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { PrismaService } from '../../persistence/prisma/prisma.service';

export enum SecurityEvent {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGIN_LOCKED = 'LOGIN_LOCKED',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  MFA_VERIFIED = 'MFA_VERIFIED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',
  PERMISSION_CHANGED = 'PERMISSION_CHANGED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  WEBHOOK_RECEIVED = 'WEBHOOK_RECEIVED',
  WEBHOOK_REJECTED = 'WEBHOOK_REJECTED',
  RATE_LIMIT_HIT = 'RATE_LIMIT_HIT',
  WAF_BLOCKED = 'WAF_BLOCKED',
  IDS_DETECTED = 'IDS_DETECTED',
  FIM_CHANGE = 'FIM_CHANGE',
}

@Injectable()
export class SecurityLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'ISO' }),
        winston.format.json(),
      ),
      defaultMeta: { service: 'nextaudit-api' },
      transports: [
        new winston.transports.File({
          filename: 'logs/security-audit.log',
          level: 'info',
          maxsize: 10 * 1024 * 1024,
          maxFiles: 10,
        }),
        new winston.transports.File({
          filename: 'logs/security-error.log',
          level: 'warn',
          maxsize: 10 * 1024 * 1024,
          maxFiles: 5,
        }),
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      );
    }
  }

  log(message: string, context?: string) {
    this.logger.info({ message, context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error({ message, trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn({ message, context });
  }

  debug(message: string, context?: string) {
    this.logger.debug({ message, context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose({ message, context });
  }

  recordSecurityEvent(
    event: SecurityEvent,
    metadata: {
      userId?: string;
      email?: string;
      ip?: string;
      userAgent?: string;
      tenantId?: string;
      details?: Record<string, unknown>;
    },
  ) {
    const payload = {
      event,
      ...metadata,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('security_event', payload);

    this.persistSecurityEvent(event, metadata).catch(() => {});
  }

  private async persistSecurityEvent(
    event: SecurityEvent,
    metadata: {
      userId?: string;
      email?: string;
      ip?: string;
      userAgent?: string;
      tenantId?: string;
      details?: Record<string, unknown>;
    },
  ): Promise<void> {
    const severityMap: Record<string, string> = {
      LOGIN_SUCCESS: 'info',
      LOGIN_FAILED: 'warn',
      LOGIN_LOCKED: 'warn',
      MFA_ENABLED: 'info',
      MFA_DISABLED: 'high',
      PASSWORD_CHANGED: 'info',
      PASSWORD_RESET: 'info',
      TOKEN_REFRESHED: 'info',
      PERMISSION_CHANGED: 'high',
      ROLE_CHANGED: 'high',
      WEBHOOK_RECEIVED: 'info',
      WEBHOOK_REJECTED: 'warn',
      RATE_LIMIT_HIT: 'info',
      WAF_BLOCKED: 'warn',
      IDS_DETECTED: 'warn',
      FIM_CHANGE: 'critical',
    };

    try {
      await this.prisma.securityLog.create({
        data: {
          event,
          severity: severityMap[event] ?? 'info',
          userId: metadata.userId,
          email: metadata.email,
          ip: metadata.ip,
          userAgent: metadata.userAgent,
          tenantId: metadata.tenantId,
          metadata: metadata.details as any ?? {},
        },
      });
    } catch {
      this.logger.warn('No se pudo persistir evento de seguridad en BD', { event });
    }
  }
}
