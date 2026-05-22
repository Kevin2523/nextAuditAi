import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../persistence/prisma/prisma.service';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async listAlerts(tenantId: string, limitValue?: string) {
    const limit = this.normalizeLimit(limitValue);
    const alerts = await this.prisma.alert.findMany({
      where: { tenantId },
      orderBy: { receivedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        tenantId: true,
        source: true,
        deviceId: true,
        hostname: true,
        message: true,
        severity: true,
        status: true,
        occurredAt: true,
        receivedAt: true,
        raw: true,
      },
    });

    return { alerts };
  }

  private normalizeLimit(value?: string): number {
    const limit = Number(value ?? 20);
    if (!Number.isFinite(limit)) return 20;
    return Math.min(Math.max(Math.trunc(limit), 1), 100);
  }
}
