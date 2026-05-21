export interface AlertIngestionRequest {
  tenantId?: string;
  source: 'n8n' | 'fleet' | 'osquery' | 'manual';
  deviceId?: string;
  hostname?: string;
  message: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  occurredAt?: string;
  raw?: Record<string, unknown>;
}
