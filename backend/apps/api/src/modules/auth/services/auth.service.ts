import { BadRequestException, ConflictException, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { generateSecret, generateURI, verify } from 'otplib';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../../persistence/prisma/prisma.service';
import { UserPasswordService } from '../../iam/services/user-password.service';
import { SecurityLoggerService, SecurityEvent } from '../../../common/logger/security-logger.service';
import type { ChangePasswordDto } from '../dto/change-password.dto';
import type { ForgotPasswordDto } from '../dto/forgot-password.dto';
import type { LoginDto } from '../dto/login.dto';
import type { MfaEnableDto, MfaVerifyLoginDto } from '../dto/mfa.dto';
import type { RefreshDto } from '../dto/refresh.dto';
import type { ResetPasswordDto } from '../dto/reset-password.dto';
import type { UpdateProfileDto } from '../dto/update-profile.dto';
import { AuthTokenService } from './auth-token.service';
import { PasswordResetMailService } from './password-reset-mail.service';

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 15_000;
const HTTP_LOCKED = 423;
const RESET_PASSWORD_TTL_MS = 15 * 60_000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: UserPasswordService,
    private readonly tokenService: AuthTokenService,
    private readonly passwordResetMail: PasswordResetMailService,
    private readonly securityLogger: SecurityLoggerService,
  ) {}

  async login(dto: LoginDto, ip: string) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email },
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
      this.securityLogger.recordSecurityEvent(SecurityEvent.LOGIN_FAILED, {
        email: dto.email,
        ip,
        details: { reason: 'user_not_found_or_inactive' },
      });
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    this.assertNotLocked(user, ip);

    const passwordMatches = await this.passwordService.verifyPassword(dto.password, user.passwordHash);
    if (!passwordMatches) {
      await this.recordFailedLogin(user.id, user.failedLoginAttempts, user.lockedUntil);
      this.securityLogger.recordSecurityEvent(SecurityEvent.LOGIN_FAILED, {
        userId: user.id,
        email: user.email,
        ip,
        details: { reason: 'invalid_password' },
      });
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    const membership = user.memberships[0];
    if (!membership) {
      this.securityLogger.recordSecurityEvent(SecurityEvent.LOGIN_FAILED, {
        userId: user.id,
        email: user.email,
        ip,
        details: { reason: 'no_membership' },
      });
      throw new UnauthorizedException('Usuario sin membresia activa.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    const passkeyCount = await this.prisma.passkey.count({ where: { userId: user.id } });

    if (user.isMfaEnabled || passkeyCount > 0) {
      return {
        mfaRequired: true,
        tempToken: await this.tokenService.signMfaTempToken({
          sub: user.id,
          purpose: 'mfa_login',
        }),
        hasMfaTotp: user.isMfaEnabled,
        hasPasskeys: passkeyCount > 0,
      };
    }

    this.securityLogger.recordSecurityEvent(SecurityEvent.LOGIN_SUCCESS, {
      userId: user.id,
      email: user.email,
      ip,
    });

    return this.issueFinalTokens(user.id);
  }

  async refresh(dto: RefreshDto) {
    const tokenHash = this.tokenService.hashRefreshToken(dto.refreshToken);

    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!stored) {
      throw new UnauthorizedException('Refresh token invalido o expirado.');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueFinalTokens(stored.userId);
  }

async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    const response = {
      message: 'Si el correo existe, se envio un enlace temporal para restablecer la contraseña.',
    };

    if (!user?.isActive) {
      return response;
    }

    const resetToken = randomBytes(32).toString('base64url');
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: this.hashOneTimeToken(resetToken),
        resetPasswordExpires: new Date(Date.now() + RESET_PASSWORD_TTL_MS),
      },
    });

    await this.passwordResetMail.sendResetLink({ email: user.email, resetToken });

    return response;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashOneTimeToken(dto.token);
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: tokenHash,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Token de recuperacion invalido o expirado.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await this.passwordService.hashPassword(dto.password),
        resetPasswordToken: null,
        resetPasswordExpires: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: 'Contrasena actualizada correctamente.' };
  }

  async generateMfa(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: 'NextAudit AI',
      label: user.email,
      secret,
    });
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        mfaSecret: secret,
        isMfaEnabled: false,
      },
    });

    return {
      secret,
      otpauthUrl,
      qrCodeDataUrl,
    };
  }

  async enableMfa(userId: string, dto: MfaEnableDto) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (!user.mfaSecret) {
      throw new BadRequestException('Primero debes generar un secreto MFA.');
    }

    const result = await verify({ token: dto.otp, secret: user.mfaSecret });
    if (!result.valid) {
      throw new UnauthorizedException('Codigo MFA invalido.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isMfaEnabled: true },
    });

    return { message: 'MFA activado correctamente.' };
  }

  async disableMfa(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (!user.isMfaEnabled) {
      throw new BadRequestException('MFA ya esta desactivado.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isMfaEnabled: false, mfaSecret: null },
    });

    return { message: 'MFA desactivado correctamente.' };
  }

  async verifyMfaLogin(dto: MfaVerifyLoginDto) {
    let claims: { sub: string; purpose: 'mfa_login' };

    try {
      claims = await this.tokenService.verifyMfaTempToken(dto.tempToken);
    } catch {
      throw new UnauthorizedException('Token temporal MFA invalido o expirado.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: claims.sub },
    });

    if (!user?.isActive || !user.isMfaEnabled || !user.mfaSecret) {
      throw new UnauthorizedException('Verificacion MFA invalida.');
    }

    const result = await verify({ token: dto.otp, secret: user.mfaSecret });
    if (!result.valid) {
      throw new UnauthorizedException('Codigo MFA invalido.');
    }

    this.securityLogger.recordSecurityEvent(SecurityEvent.LOGIN_SUCCESS, {
      userId: user.id,
      email: user.email,
      details: { method: 'mfa_otp' },
    });

    return this.issueFinalTokens(user.id);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const passwordMatches = await this.passwordService.verifyPassword(dto.currentPassword, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Contrasena actual incorrecta.');
    }

    const data: Record<string, unknown> = {};
    let emailChanged = false;

    if (dto.displayName !== undefined) {
      data.displayName = dto.displayName.trim();
    }

    if (dto.email !== undefined) {
      const newEmail = dto.email.toLowerCase().trim();
      if (newEmail !== user.email) {
        const existing = await this.prisma.user.findUnique({ where: { email: newEmail } });
        if (existing) {
          throw new ConflictException('El correo electronico ya esta en uso.');
        }
        data.email = newEmail;
        emailChanged = true;
      }
    }

    if (Object.keys(data).length === 0) {
      return { message: 'Sin cambios para actualizar.' };
    }

    await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    if (emailChanged) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    const result = await this.issueFinalTokens(userId);
    return {
      ...result,
      reauthenticate: emailChanged,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const passwordMatches = await this.passwordService.verifyPassword(dto.currentPassword, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Contrasena actual incorrecta.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: await this.passwordService.hashPassword(dto.newPassword),
      },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    const result = await this.issueFinalTokens(userId);
    return {
      ...result,
      reauthenticate: true,
    };
  }

  private assertNotLocked(user: { id: string; email: string; lockedUntil: Date | null }, ip: string): void {
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      this.securityLogger.recordSecurityEvent(SecurityEvent.LOGIN_LOCKED, {
        userId: user.id,
        email: user.email,
        ip,
        details: { reason: 'account_locked' },
      });
      throw new HttpException('Cuenta temporalmente bloqueada.', HTTP_LOCKED);
    }
  }

  private async recordFailedLogin(userId: string, failedLoginAttempts: number, lockedUntil: Date | null) {
    const lockExpired = lockedUntil && lockedUntil.getTime() <= Date.now();
    const nextAttempts = (lockExpired ? 0 : failedLoginAttempts) + 1;
    const shouldLock = nextAttempts >= MAX_FAILED_LOGIN_ATTEMPTS;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: shouldLock ? MAX_FAILED_LOGIN_ATTEMPTS : nextAttempts,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MS) : null,
      },
    });
  }

  private async issueFinalTokens(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            role: true,
          },
          take: 1,
        },
      },
    });
    const membership = user.memberships[0];

    if (!membership) {
      throw new UnauthorizedException('Usuario sin membresia activa.');
    }

    const accessToken = await this.tokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      role: membership.role.code,
      tenant_id: membership.tenantId,
      displayName: user.displayName,
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

  private hashOneTimeToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
