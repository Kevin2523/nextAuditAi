import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { WafService } from './waf.service';
import { SecurityEvent, SecurityLoggerService } from '../logger/security-logger.service';

@Injectable()
export class WafMiddleware implements NestMiddleware {
  private readonly excludedPaths = ['/api/docs', '/n8n-webhook', '/api/v1/security/waf/test', '/api/v1/auth'];

  constructor(
    private readonly wafService: WafService,
    private readonly securityLogger: SecurityLoggerService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const path = req.originalUrl || req.url;

    for (const excluded of this.excludedPaths) {
      if (path.startsWith(excluded)) {
        next();
        return;
      }
    }

    const result = this.wafService.inspectPayload(
      req.body,
      req.query as Record<string, string | string[]>,
      req.params as Record<string, string>,
      path,
      req.headers['user-agent'],
    );

    if (result.blocked) {
      this.securityLogger.recordSecurityEvent(SecurityEvent.WAF_BLOCKED, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        details: {
          path,
          method: req.method,
          reason: result.reason,
          rule: result.rule,
          severity: result.severity,
        },
      });

      res.status(403).json({
        statusCode: 403,
        message: 'Buen intento crack. Eso no funcionara aqui.',
        error: 'Forbidden',
      });
      return;
    }

    next();
  }
}
