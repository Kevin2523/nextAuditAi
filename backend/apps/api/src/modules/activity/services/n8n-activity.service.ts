import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type N8nLoginResponse = {
  data?: unknown;
};

@Injectable()
export class N8nActivityService {
  private cachedCookie: string | null = null;

  constructor(private readonly config: ConfigService) {}

  private isConfigured(): { ok: false } | { ok: true; baseUrl: string; apiKey: string } {
    const baseUrl = this.config.get<string>('N8N_BASE_URL')?.replace(/\/$/, '');
    if (!baseUrl) return { ok: false };

    const apiKey = this.config.get<string>('N8N_API_KEY')?.trim();
    if (apiKey) return { ok: true, baseUrl, apiKey };

    const email = this.config.get<string>('N8N_EMAIL')?.trim();
    const password = this.config.get<string>('N8N_PASSWORD');
    if (!email || !password) return { ok: false };

    return { ok: true, baseUrl, apiKey: '' };
  }

  async getExecutions(limitValue?: string): Promise<unknown> {
    try {
      const cfg = this.isConfigured();
      if (!cfg.ok) return { executions: [], isConfigured: false };

      const baseUrl = cfg.baseUrl;
      const limit = this.normalizeLimit(limitValue);
      const headers = await this.buildHeaders(baseUrl, cfg.apiKey);

      const response = await fetch(`${baseUrl}/rest/executions?limit=${limit}`, {
        headers,
      });

      if (response.status === 401 && this.cachedCookie) {
        this.cachedCookie = null;
        return this.getExecutions(limitValue);
      }

      return this.parseN8nResponse(response);
    } catch (error) {
      return { data: { result: [] }, message: 'N8n integration disabled or unavailable' };
    }
  }

  private async buildHeaders(baseUrl: string, apiKey: string): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (apiKey) {
      headers['X-N8N-API-KEY'] = apiKey;
      return headers;
    }

    headers.Cookie = await this.getSessionCookie(baseUrl);
    return headers;
  }

  private async getSessionCookie(baseUrl: string): Promise<string> {
    if (this.cachedCookie) return this.cachedCookie;

    const email = this.config.get<string>('N8N_EMAIL')?.trim();
    const password = this.config.get<string>('N8N_PASSWORD');

    const response = await fetch(`${baseUrl}/rest/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ emailOrLdapLoginId: email, password }),
    });

    await this.parseN8nResponse(response);

    const cookie = response.headers.get('set-cookie')?.split(';')[0];
    if (!cookie) {
      throw new BadGatewayException('n8n no devolvio cookie de sesion.');
    }

    this.cachedCookie = cookie;
    return cookie;
  }

  private normalizeLimit(value?: string): number {
    const limit = Number(value ?? 20);
    if (!Number.isFinite(limit)) return 20;
    return Math.min(Math.max(Math.trunc(limit), 1), 100);
  }

  private async parseN8nResponse(response: Response): Promise<unknown> {
    const text = await response.text();
    const data = text ? this.parseJson(text) : null;

    if (!response.ok) {
      throw new BadGatewayException({
        message: 'n8n respondio con error.',
        statusCode: response.status,
        detail: data,
      });
    }

    return data as N8nLoginResponse;
  }

  private parseJson(text: string): unknown {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
}
