import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma/prisma.service';
import { WafService } from '../../common/waf/waf.service';
import { IdsService } from '../../common/ids/ids.service';
import { WAF_RULES } from '../../common/waf/waf-rules';
import { IDS_SIGNATURES, MAX_404_PER_IP, MAX_FAILED_LOGIN_PER_IP, MAX_REQUESTS_PER_IP, WINDOW_MS, BLOCK_DURATION_MS, MAX_PAYLOAD_SIZE } from '../../common/ids/ids-signatures';

@Injectable()
export class SecurityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wafService: WafService,
    private readonly idsService: IdsService,
  ) {}

  getWafRules() {
    return WAF_RULES.map((r) => ({
      name: r.name,
      attack: r.attack,
      severity: r.severity,
      locations: r.locations,
      pattern: r.pattern.source,
      enabled: true,
    }));
  }

  async getWafStats() {
    const [totalBlocks, lastBlocked] = await Promise.all([
      this.prisma.securityLog.count({ where: { event: 'WAF_BLOCKED' } }).catch(() => 0),
      this.prisma.securityLog.findFirst({
        where: { event: 'WAF_BLOCKED' },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }).catch(() => null),
    ]);

    return {
      rulesCount: WAF_RULES.length,
      totalBlocks,
      lastBlocked: lastBlocked?.createdAt?.toISOString() ?? null,
    };
  }

  getIdsSignatures() {
    return {
      signatures: Object.values(IDS_SIGNATURES),
      thresholds: {
        max404PerIp: MAX_404_PER_IP,
        maxFailedLoginPerIp: MAX_FAILED_LOGIN_PER_IP,
        maxRequestsPerIp: MAX_REQUESTS_PER_IP,
        windowMs: WINDOW_MS,
        blockDurationMs: BLOCK_DURATION_MS,
        maxPayloadSize: MAX_PAYLOAD_SIZE,
      },
    };
  }

  getIdsStats() {
    return {
      trackedIps: this.idsService.getTrackedIpCount(),
      blockedIps: this.idsService.getBlockedIpCount(),
    };
  }

  async getLogs(params: {
    event?: string;
    severity?: string;
    ip?: string;
    email?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: Record<string, unknown> = {};

    if (params.event) where.event = params.event;
    if (params.severity) where.severity = params.severity;
    if (params.ip) where.ip = { contains: params.ip };
    if (params.email) where.email = { contains: params.email };
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) (where.createdAt as Record<string, unknown>).gte = new Date(params.startDate);
      if (params.endDate) (where.createdAt as Record<string, unknown>).lte = new Date(params.endDate);
    }

    const limit = Math.min(Math.max(params.limit ?? 50, 1), 200);
    const offset = Math.max(params.offset ?? 0, 0);

    try {
      const [logs, total] = await Promise.all([
        this.prisma.securityLog.findMany({
          where: where as any,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
          select: {
            id: true,
            event: true,
            severity: true,
            ip: true,
            email: true,
            userId: true,
            metadata: true,
            createdAt: true,
          },
        }),
        this.prisma.securityLog.count({ where: where as any }),
      ]);

      return {
        logs: logs.map((log) => ({
          id: log.id,
          event: log.event,
          severity: log.severity,
          ip: log.ip,
          email: log.email,
          userId: log.userId,
          details: log.metadata,
          timestamp: log.createdAt.toISOString(),
        })),
        total,
        limit,
        offset,
      };
    } catch {
      return { logs: [], total: 0, limit, offset };
    }
  }

  async getSummary() {
    try {
      const allLogs = await this.prisma.securityLog.groupBy({
        by: ['event'],
        _count: { event: true },
        orderBy: { _count: { event: 'desc' } },
      });

      const bySeverity = await this.prisma.securityLog.groupBy({
        by: ['severity'],
        _count: { severity: true },
        orderBy: { _count: { severity: 'desc' } },
      });

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayCount = await this.prisma.securityLog.count({
        where: { createdAt: { gte: todayStart } },
      });

      return {
        totalEvents: allLogs.reduce((sum, g) => sum + g._count.event, 0),
        byEvent: allLogs.map((g) => ({ event: g.event, count: g._count.event })),
        bySeverity: bySeverity.map((g) => ({ severity: g.severity, count: g._count.severity })),
        todayCount,
      };
    } catch {
      return { totalEvents: 0, byEvent: [], bySeverity: [], todayCount: 0 };
    }
  }

  async testWafPayload(payload: string) {
    const result = this.wafService.inspectPayload(payload, {}, {}, '/test');
    return {
      blocked: result.blocked,
      reason: result.reason ?? null,
      rule: result.rule ?? null,
      severity: result.severity ?? null,
    };
  }
}
