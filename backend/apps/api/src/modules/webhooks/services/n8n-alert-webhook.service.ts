import { BadRequestException, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../../../persistence/prisma/prisma.service';
import type { N8nAlertWebhookDto } from '../dto/n8n-alert-webhook.dto';

enum AlertSeverity {
  info = 'info',
  low = 'low',
  medium = 'medium',
  high = 'high',
  critical = 'critical',
}

const TENANT_LOCAL_POR_DEFECTO = '00000000-0000-4000-8000-000000000001';

@Injectable()
export class N8nAlertWebhookService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async receiveAlert(dto: N8nAlertWebhookDto, secretHeader?: string) {
    this.validateSecret(secretHeader);

    const tenantId = dto.tenantId ?? this.config.get<string>('DEFAULT_TENANT_ID') ?? TENANT_LOCAL_POR_DEFECTO;
    const severity = this.normalizeSeverity(dto.severity ?? dto.severidad);
    const occurredAt = this.parseDate(dto.occurredAt ?? dto.timestamp);
    const hostname = dto.hostname ?? dto.dispositivo;

    const alert = await this.prisma.alert.create({
      data: {
        tenantId,
        source: 'n8n',
        deviceId: dto.deviceId ?? dto.dispositivo,
        hostname,
        message: dto.mensaje,
        severity,
        occurredAt,
        raw: this.buildRawPayload(dto),
      },
      select: {
        id: true,
        tenantId: true,
        severity: true,
        status: true,
        receivedAt: true,
      },
    });

    return {
      message: 'Alerta recibida correctamente',
      alert,
    };
  }

  private validateSecret(secretHeader?: string): void {
    const expectedSecret = this.config.get<string>('N8N_WEBHOOK_SECRET');

    if (!expectedSecret) {
      throw new ServiceUnavailableException('Webhook no configurado.');
    }

    if (!secretHeader || !this.secureEquals(secretHeader, expectedSecret)) {
      throw new UnauthorizedException('Secreto de webhook invalido.');
    }
  }

  private secureEquals(received: string, expected: string): boolean {
    const receivedBuffer = Buffer.from(received);
    const expectedBuffer = Buffer.from(expected);

    if (receivedBuffer.length !== expectedBuffer.length) return false;

    return timingSafeEqual(receivedBuffer, expectedBuffer);
  }

  private normalizeSeverity(severity?: string): AlertSeverity {
    if (!severity) return AlertSeverity.info;

    if (severity in AlertSeverity) {
      return severity as AlertSeverity;
    }

    throw new BadRequestException('Severidad invalida.');
  }

  private parseDate(value?: string): Date {
    if (!value) return new Date();

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Fecha de alerta invalida.');
    }

    return date;
  }

  private buildRawPayload(dto: N8nAlertWebhookDto) {
    return {
      ...dto.raw,
      tenantId: dto.tenantId,
      dispositivo: dto.dispositivo,
      deviceId: dto.deviceId,
      hostname: dto.hostname,
      mensaje: dto.mensaje,
      severidad: dto.severidad,
      severity: dto.severity,
      timestamp: dto.timestamp,
      occurredAt: dto.occurredAt,
    };
  }
}
