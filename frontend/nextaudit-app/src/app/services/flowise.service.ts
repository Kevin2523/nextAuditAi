import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface ChatResponse {
  text: string;
  answer?: string;
  response?: string;
  sessionId?: string;
}

@Injectable({ providedIn: 'root' })
export class FlowiseService {
  private readonly endpoint = '/api/v1/ai/chat';

  constructor(private readonly http: HttpClient) {}

  async sendMessage(question: string, sessionId?: string): Promise<ChatResponse> {
    const body: Record<string, string> = { message: question };
    if (sessionId) body['sessionId'] = sessionId;

    const data = await firstValueFrom(this.http.post<ChatResponse>(this.endpoint, body));

    return {
      text: data.text || data.answer || data.response || 'Sin respuesta del agente.',
      sessionId: data.sessionId ?? sessionId
    };
  }

  async requestRemediation(context: string, sessionId?: string): Promise<ChatResponse> {
    const question = [
      'Basándote en la siguiente información de seguridad:',
      '',
      `"${context.substring(0, 500)}"`,
      '',
      'Genera un plan de remediación detallado con pasos concretos, priorizados por severidad.',
      'Incluye los comandos o playbooks necesarios para cada paso.',
      'Usa formato de lista numerada.'
    ].join('\n');

    return this.sendMessage(question, sessionId);
  }

  async generateReport(topic: string, sessionId?: string): Promise<ChatResponse> {
    const question = `Genera un reporte formal de auditoría y cumplimiento sobre: ${topic.substring(0, 200)}. Incluye resumen ejecutivo, hallazgos, riesgos identificados y recomendaciones.`;
    return this.sendMessage(question, sessionId);
  }

  formatMarkdown(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="code-block"><code class="lang-$1">$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<h4 class="mt-4 mb-1 font-semibold text-dark">$1</h4>')
      .replace(/^## (.+)$/gm, '<h3 class="mt-5 mb-2 font-bold text-dark text-lg">$1</h3>')
      .replace(/^# (.+)$/gm, '<h2 class="mt-6 mb-2 font-bold text-dark text-xl">$1</h2>')
      .replace(/^\d+\. (.+)$/gm, '<div class="pl-4 py-0.5">• $1</div>')
      .replace(/^- (.+)$/gm, '<div class="pl-4 py-0.5">• $1</div>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }
}
