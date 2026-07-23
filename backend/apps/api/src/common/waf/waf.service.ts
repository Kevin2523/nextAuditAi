import { Injectable } from '@nestjs/common';
import { WAF_RULES, SUSPICIOUS_USER_AGENTS, type WafRule } from './waf-rules';

export interface WafResult {
  blocked: boolean;
  reason?: string;
  rule?: string;
  severity?: string;
}

@Injectable()
export class WafService {
  private readonly rules: WafRule[] = WAF_RULES;
  private readonly suspiciousUa: RegExp[] = SUSPICIOUS_USER_AGENTS;

  inspectPayload(
    body: unknown,
    query: Record<string, string | string[]>,
    params: Record<string, string>,
    path: string,
    userAgent?: string,
  ): WafResult {
    const bodyStr = typeof body === 'object' && body !== null ? JSON.stringify(body) : String(body ?? '');
    const queryStr = JSON.stringify(query);
    const paramsStr = JSON.stringify(params);

    for (const rule of this.rules) {
      let testStr = '';

      if (rule.locations.includes('body')) testStr += bodyStr + ' ';
      if (rule.locations.includes('query')) testStr += queryStr + ' ';
      if (rule.locations.includes('params')) testStr += paramsStr + ' ';
      if (rule.locations.includes('path')) testStr += path + ' ';

      if (rule.pattern.test(testStr)) {
        return {
          blocked: true,
          reason: `WAF bloqueo: ${rule.attack} detectado (${rule.name})`,
          rule: rule.name,
          severity: rule.severity,
        };
      }
    }

    if (userAgent) {
      for (const ua of this.suspiciousUa) {
        if (ua.test(userAgent)) {
          return {
            blocked: true,
            reason: `WAF bloqueo: User-Agent sospechoso detectado`,
            rule: 'SUSPICIOUS_UA',
            severity: 'high',
          };
        }
      }
    }

    return { blocked: false };
  }

  inspectResponseBody(body: string): WafResult {
    for (const rule of this.rules) {
      if (rule.locations.includes('body') && rule.pattern.test(body)) {
        return {
          blocked: false,
          reason: `WAF detecto posible fuga en respuesta: ${rule.attack}`,
          rule: rule.name,
          severity: rule.severity,
        };
      }
    }

    return { blocked: false };
  }
}
