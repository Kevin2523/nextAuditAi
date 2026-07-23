import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type FleetLoginResponse = {
  token?: string;
};

@Injectable()
export class FleetReadService {
  private cachedToken: string | null = null;

  constructor(private readonly config: ConfigService) {
    if (this.config.get<string>('FLEET_TLS_REJECT_UNAUTHORIZED') === 'false') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }
  }

  private isConfigured(): { ok: false } | { ok: true; baseUrl: string; token: string } {
    const baseUrl = this.config.get<string>('FLEET_BASE_URL')?.replace(/\/$/, '');
    if (!baseUrl) return { ok: false };

    const configuredToken = this.config.get<string>('FLEET_API_TOKEN')?.trim();
    if (configuredToken) return { ok: true, baseUrl, token: configuredToken };

    const email = this.config.get<string>('FLEET_EMAIL');
    const password = this.config.get<string>('FLEET_PASSWORD');
    if (!email || !password) return { ok: false };

    return { ok: true, baseUrl, token: '' };
  }

  async getHosts(): Promise<unknown> {
    const cfg = this.isConfigured();
    if (!cfg.ok) return { hosts: [], isConfigured: false };
    return this.requestFleet(cfg, '/api/v1/fleet/hosts');
  }

  async getVulnerabilities(): Promise<unknown> {
    const cfg = this.isConfigured();
    if (!cfg.ok) return { vulnerabilities: [], isConfigured: false };
    return this.requestFleet(cfg, '/api/v1/fleet/vulnerabilities');
  }

  async sync(): Promise<{ status: string }> {
    const cfg = this.isConfigured();
    if (!cfg.ok) return { status: 'no_configurado' };
    await this.requestFleet(cfg, '/api/v1/fleet/hosts');
    return { status: 'sincronizacion_solicitada' };
  }

  private async requestFleet(cfg: { baseUrl: string; token: string }, path: string): Promise<unknown> {
    try {
      let token = cfg.token;
      if (!token) {
        token = await this.getFleetToken(cfg.baseUrl);
      }

      const response = await fetch(`${cfg.baseUrl}${path}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      return this.parseFleetResponse(response);
    } catch (error) {
      return { hosts: [], vulnerabilities: [], message: 'Fleet integration disabled or unavailable' };
    }
  }

  private async getFleetToken(baseUrl: string): Promise<string> {
    if (this.cachedToken) return this.cachedToken;

    const email = this.config.get<string>('FLEET_EMAIL');
    const password = this.config.get<string>('FLEET_PASSWORD');

    const response = await fetch(`${baseUrl}/api/v1/fleet/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = (await this.parseFleetResponse(response)) as FleetLoginResponse;

    if (!data.token) {
      throw new BadGatewayException('Fleet no devolvio token de autenticacion.');
    }

    this.cachedToken = data.token;
    return data.token;
  }

  private async parseFleetResponse(response: Response): Promise<unknown> {
    const text = await response.text();
    const data = text ? this.parseJson(text) : null;

    if (!response.ok) {
      throw new BadGatewayException({
        message: 'Fleet respondio con error.',
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
