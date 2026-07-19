import { randomBytes, createHash } from 'node:crypto';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export interface AccessTokenClaims {
  sub: string;
  email: string;
  role: string;
  tenant_id: string;
  displayName?: string;
}

export interface MfaTempTokenClaims {
  sub: string;
  purpose: 'mfa_login';
}

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async signAccessToken(claims: AccessTokenClaims): Promise<string> {
    return this.jwtService.signAsync(claims, {
      secret: this.getRequiredConfig('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_TTL') ?? '15m',
    });
  }

  async signMfaTempToken(claims: MfaTempTokenClaims): Promise<string> {
    return this.jwtService.signAsync(claims, {
      secret: this.getRequiredConfig('JWT_ACCESS_SECRET'),
      expiresIn: '5m',
    });
  }

  async verifyMfaTempToken(token: string): Promise<MfaTempTokenClaims> {
    const claims = await this.jwtService.verifyAsync<MfaTempTokenClaims>(token, {
      secret: this.getRequiredConfig('JWT_ACCESS_SECRET'),
    });

    if (claims.purpose !== 'mfa_login') {
      throw new Error('Token temporal invalido.');
    }

    return claims;
  }

  generateRefreshToken(): string {
    return randomBytes(48).toString('base64url');
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  getRefreshTokenExpiration(): Date {
    const ttlDays = Number(this.config.get<string>('JWT_REFRESH_TTL_DAYS') ?? '7');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttlDays);
    return expiresAt;
  }

  private getRequiredConfig(key: string): string {
    const value = this.config.get<string>(key);
    if (!value) {
      throw new ServiceUnavailableException(`${key} no esta configurado.`);
    }

    return value;
  }
}
