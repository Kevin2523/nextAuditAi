import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AiChatDto, AiRemediationDto, AiReportDto } from '../dto/ai-chat.dto';

type FlowiseResponse = {
  text?: string;
  answer?: string;
  response?: string;
  sessionId?: string;
};

@Injectable()
export class AiChatService {
  constructor(private readonly config: ConfigService) {}

  async sendMessage(dto: AiChatDto) {
    return this.requestFlowise(dto.message, dto.sessionId);
  }

  async requestRemediation(dto: AiRemediationDto) {
    const question = [
      'Basandote en la siguiente informacion de seguridad:',
      '',
      `"${dto.context.substring(0, 500)}"`,
      '',
      'Genera un plan de remediacion detallado con pasos concretos, priorizados por severidad.',
      'Incluye los comandos o playbooks necesarios para cada paso.',
      'Usa formato de lista numerada.',
    ].join('\n');

    return this.requestFlowise(question, dto.sessionId);
  }

  async generateReport(dto: AiReportDto) {
    const question = `Genera un reporte formal de auditoria y cumplimiento sobre: ${dto.topic.substring(
      0,
      200,
    )}. Incluye resumen ejecutivo, hallazgos, riesgos identificados y recomendaciones.`;

    return this.requestFlowise(question, dto.sessionId);
  }

  private async requestFlowise(question: string, sessionId?: string) {
    const endpoint = this.getFlowiseEndpoint();
    const body: Record<string, string> = { question };
    if (sessionId) body.sessionId = sessionId;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const apiKey = this.config.get<string>('FLOWISE_API_KEY')?.trim();
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = (await this.parseFlowiseResponse(response)) as FlowiseResponse;

    return {
      text: data.text ?? data.answer ?? data.response ?? 'Sin respuesta del agente.',
      sessionId: data.sessionId ?? sessionId,
    };
  }

  private getFlowiseEndpoint(): string {
    const baseUrl = this.config.get<string>('FLOWISE_BASE_URL')?.replace(/\/$/, '');
    const chatflowId = this.config.get<string>('FLOWISE_CHATFLOW_ID');

    if (!baseUrl || !chatflowId) {
      throw new ServiceUnavailableException('Flowise no esta configurado en backend.');
    }

    return `${baseUrl}/api/v1/prediction/${chatflowId}`;
  }

  private async parseFlowiseResponse(response: Response): Promise<unknown> {
    const text = await response.text();
    const data = text ? this.parseJson(text) : null;

    if (!response.ok) {
      throw new BadGatewayException({
        message: 'Flowise respondio con error.',
        statusCode: response.status,
        detail: data,
      });
    }

    return data;
  }

  private parseJson(text: string): unknown {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
}
