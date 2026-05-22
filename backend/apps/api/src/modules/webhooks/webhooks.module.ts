import { Module } from '@nestjs/common';
import { LegacyWebhooksController, WebhooksController } from './webhooks.controller';
import { N8nAlertWebhookService } from './services/n8n-alert-webhook.service';

@Module({
  controllers: [WebhooksController, LegacyWebhooksController],
  providers: [N8nAlertWebhookService],
})
export class WebhooksModule {}
