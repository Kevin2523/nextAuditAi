import type { AlertIngestionRequest } from '../contracts/alerts/alert-ingestion.contract';

export interface AlertCreatedEvent {
  id: string;
  tenantId: string;
  alert: AlertIngestionRequest;
  createdAt: string;
}
