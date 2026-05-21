import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../persistence/prisma/prisma.service';
import { UserPasswordService } from '../../iam/services/user-password.service';
import type { LoginDto } from '../dto/login.dto';
import { AuthTokenService } from './auth-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: UserPasswordService,
    private readonly tokenService: AuthTokenService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        memberships: {
          include: {
            tenant: true,
            role: true,
          },
          take: 1,
        },
      },
    });

    if (!user?.isActive) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    const passwordMatches = await this.passwordService.verifyPassword(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    const membership = user.memberships[0];
    if (!membership) {
      throw new UnauthorizedException('Usuario sin membresia activa.');
    }

    const accessToken = await this.tokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      role: membership.role.code,
      tenant_id: membership.tenantId,
    });

    const refreshToken = this.tokenService.generateRefreshToken();
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.tokenService.hashRefreshToken(refreshToken),
        expiresAt: this.tokenService.getRefreshTokenExpiration(),
      },
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: membership.role.code,
        tenantId: membership.tenantId,
      },
    };
  }
}
