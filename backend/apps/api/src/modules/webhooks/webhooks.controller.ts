import { Body, Controller, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { N8nAlertWebhookDto } from './dto/n8n-alert-webhook.dto';
import { N8nAlertWebhookService } from './services/n8n-alert-webhook.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly n8nAlertWebhookService: N8nAlertWebhookService) {}

  @Post('n8n/alerts')
  @HttpCode(HttpStatus.ACCEPTED)
  receiveN8nAlert(
    @Body() body: N8nAlertWebhookDto,
    @Headers('x-nextaudit-webhook-secret') secretHeader?: string,
  ) {
    return this.n8nAlertWebhookService.receiveAlert(body, secretHeader);
  }
}
