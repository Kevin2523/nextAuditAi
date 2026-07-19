import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

type JwtClaims = {
  sub: string;
  email: string;
  role: string;
  tenant_id: string;
  displayName?: string;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: unknown;
    }>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token bearer requerido.');
    }

    const accessSecret = this.config.get<string>('JWT_ACCESS_SECRET');
    if (!accessSecret) {
      throw new ServiceUnavailableException('JWT_ACCESS_SECRET no esta configurado.');
    }

    const token = authorization.slice('Bearer '.length).trim();

    try {
      const claims = await this.jwtService.verifyAsync<JwtClaims>(token, {
        secret: accessSecret,
      });

      request.user = {
        sub: claims.sub,
        email: claims.email,
        role: claims.role,
        tenantId: claims.tenant_id,
        displayName: claims.displayName,
      };
    } catch {
      throw new UnauthorizedException('Token invalido o expirado.');
    }

    return true;
  }
}
