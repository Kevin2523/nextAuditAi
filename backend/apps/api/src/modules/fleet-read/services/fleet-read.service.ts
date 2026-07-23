import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
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

  async getHosts(): Promise<unknown> {
    return this.requestFleet('/api/v1/fleet/hosts');
  }

  async getVulnerabilities(): Promise<unknown> {
    return this.requestFleet('/api/v1/fleet/vulnerabilities');
  }

  async sync(): Promise<{ status: string }> {
    await this.getHosts();
    return { status: 'sincronizacion_solicitada' };
  }

  private async requestFleet(path: string): Promise<unknown> {
    try {
      const baseUrl = this.getFleetBaseUrl();
      const token = await this.getFleetToken(baseUrl);

      const response = await fetch(`${baseUrl}${path}`, {
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

  private getFleetBaseUrl(): string {
    const baseUrl = this.config.get<string>('FLEET_BASE_URL')?.replace(/\/$/, '');

    if (!baseUrl) {
      throw new ServiceUnavailableException('FLEET_BASE_URL no esta configurado.');
    }

    return baseUrl;
  }

  private async getFleetToken(baseUrl: string): Promise<string> {
    const configuredToken = this.config.get<string>('FLEET_API_TOKEN')?.trim();
    if (configuredToken) return configuredToken;

    if (this.cachedToken) return this.cachedToken;

    const email = this.config.get<string>('FLEET_EMAIL');
    const password = this.config.get<string>('FLEET_PASSWORD');

    if (!email || !password) {
      throw new ServiceUnavailableException('Credenciales de Fleet no configuradas en backend.');
    }

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
