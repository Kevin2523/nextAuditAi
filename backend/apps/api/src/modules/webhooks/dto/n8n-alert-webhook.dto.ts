import { IsIn, IsISO8601, IsObject, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

const severidadesPermitidas = ['info', 'low', 'medium', 'high', 'critical'] as const;

export class N8nAlertWebhookDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  dispositivo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  deviceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  hostname?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(5000)
  mensaje!: string;

  @IsOptional()
  @IsIn(severidadesPermitidas)
  severidad?: (typeof severidadesPermitidas)[number];

  @IsOptional()
  @IsIn(severidadesPermitidas)
  severity?: (typeof severidadesPermitidas)[number];

  @IsOptional()
  @IsISO8601()
  timestamp?: string;

  @IsOptional()
  @IsISO8601()
  occurredAt?: string;

  @IsOptional()
  @IsObject()
  raw?: Record<string, unknown>;
}
