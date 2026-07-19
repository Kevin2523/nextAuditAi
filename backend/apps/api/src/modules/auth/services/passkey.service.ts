import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../../persistence/prisma/prisma.service';
import { AuthTokenService } from './auth-token.service';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  GenerateRegistrationOptionsOpts,
  VerifyRegistrationResponseOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server';
import type { Passkey } from '@prisma/client';
import { randomUUID } from 'crypto';
import type { PasskeyRegisterCompleteDto, PasskeyLoginCompleteDto } from '../dto/passkey.dto';

const RP_NAME = 'NextAudit AI';
const RP_ID = process.env.WEBAUTHN_RP_ID ?? 'localhost';
const RP_ORIGIN = process.env.WEBAUTHN_ORIGIN ?? 'http://localhost:4200';
const CHALLENGE_TTL_MS = 5 * 60_000;

interface ChallengeData {
  challenge: string;
  email?: string;
  userId?: string;
}

@Injectable()
export class PasskeyService {
  private readonly challengeStore = new Map<string, ChallengeData>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: AuthTokenService,
  ) {}

  async generateRegistrationOptions(userId: string, deviceName?: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const existing = await this.prisma.passkey.findMany({ where: { userId } });

    const opts: GenerateRegistrationOptionsOpts = {
      rpName: RP_NAME,
      rpID: RP_ID,
      userName: user.email,
      userDisplayName: user.displayName,
      attestationType: 'none',
      excludeCredentials: existing.map((pk: { credentialId: string; transports: string | null }) => ({
        id: pk.credentialId,
        type: 'public-key',
        transports: pk.transports ? (JSON.parse(pk.transports) as AuthenticatorTransport[]) : undefined,
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'required',
        authenticatorAttachment: 'cross-platform',
      },
    };

    const options = await generateRegistrationOptions(opts);
    const sessionId = randomUUID();
    this.challengeStore.set(sessionId, {
      challenge: options.challenge,
      userId,
    });
    setTimeout(() => this.challengeStore.delete(sessionId), CHALLENGE_TTL_MS);

    return { sessionId, options, deviceName };
  }

  async verifyRegistration(userId: string, dto: PasskeyRegisterCompleteDto) {
    const data = this.challengeStore.get(dto.sessionId);
    if (!data || data.userId !== userId) {
      throw new BadRequestException('Challenge expirado o invalido. Vuelve a intentarlo.');
    }
    this.challengeStore.delete(dto.sessionId);

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const verification = await verifyRegistrationResponse({
      response: {
        id: dto.id,
        rawId: dto.rawId,
        response: dto.response as any,
        clientExtensionResults: {},
        type: 'public-key',
      },
      expectedChallenge: data.challenge,
      expectedOrigin: RP_ORIGIN,
      expectedRPID: RP_ID,
    } satisfies VerifyRegistrationResponseOpts);

    if (!verification.verified || !verification.registrationInfo) {
      throw new BadRequestException('No se pudo verificar el registro de la passkey.');
    }

    const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

    await this.prisma.passkey.create({
      data: {
        userId,
        credentialId: Buffer.from(credentialID).toString('base64url'),
        publicKey: Buffer.from(credentialPublicKey),
        counter: BigInt(counter),
        transports: dto.response.transports
          ? JSON.stringify(dto.response.transports)
          : undefined,
        deviceName: dto.deviceName ?? null,
        deviceType: dto.response.deviceType ?? null,
        backedUp: dto.response.backedUp ?? false,
      },
    });

    return { message: 'Passkey registrada exitosamente.' };
  }

  async generateLoginOptions(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user?.isActive) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    const passkeys = await this.prisma.passkey.findMany({ where: { userId: user.id } });
    if (passkeys.length === 0) {
      throw new BadRequestException('No hay passkeys registradas para este usuario.');
    }

    const opts: GenerateAuthenticationOptionsOpts = {
      rpID: RP_ID,
      allowCredentials: passkeys.map((pk: { credentialId: string; transports: string | null }) => ({
        id: pk.credentialId,
        type: 'public-key',
        transports: pk.transports ? (JSON.parse(pk.transports) as AuthenticatorTransport[]) : undefined,
      })),
      userVerification: 'required',
    };

    const options = await generateAuthenticationOptions(opts);
    const sessionId = randomUUID();
    this.challengeStore.set(sessionId, { challenge: options.challenge, email: user.email });
    setTimeout(() => this.challengeStore.delete(sessionId), CHALLENGE_TTL_MS);

    return { sessionId, options };
  }

  async verifyLogin(dto: PasskeyLoginCompleteDto) {
    const data = this.challengeStore.get(dto.sessionId);
    if (!data || !data.email) {
      throw new BadRequestException('Challenge expirado o invalido. Vuelve a intentarlo.');
    }
    this.challengeStore.delete(dto.sessionId);

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { email: data.email },
      include: { memberships: { include: { role: true }, take: 1 } },
    });

    if (!user?.isActive) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    const passkey = await this.prisma.passkey.findUnique({
      where: { credentialId: dto.id },
    });

    if (!passkey || passkey.userId !== user.id) {
      throw new UnauthorizedException('Passkey no encontrada.');
    }

    const verification = await verifyAuthenticationResponse({
      response: {
        id: dto.id,
        rawId: dto.rawId,
        response: dto.response,
        clientExtensionResults: {},
        type: 'public-key',
      },
      expectedChallenge: data.challenge,
      expectedOrigin: RP_ORIGIN,
      expectedRPID: RP_ID,
      authenticator: {
        credentialID: passkey.credentialId,
        credentialPublicKey: new Uint8Array(passkey.publicKey),
        counter: Number(passkey.counter),
        transports: passkey.transports ? (JSON.parse(passkey.transports) as AuthenticatorTransport[]) : undefined,
      },
    } satisfies VerifyAuthenticationResponseOpts);

    if (!verification.verified) {
      throw new UnauthorizedException('Verificacion de passkey fallida.');
    }

    await this.prisma.passkey.update({
      where: { id: passkey.id },
      data: {
        counter: BigInt(verification.authenticationInfo.newCounter),
        lastUsedAt: new Date(),
      },
    });

    return this.issueFinalTokens(user.id);
  }

  async listPasskeys(userId: string) {
    const passkeys = await this.prisma.passkey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return passkeys.map((pk: { id: string; deviceName: string | null; deviceType: string | null; backedUp: boolean; createdAt: Date; lastUsedAt: Date | null }) => ({
      id: pk.id,
      deviceName: pk.deviceName,
      deviceType: pk.deviceType,
      backedUp: pk.backedUp,
      createdAt: pk.createdAt,
      lastUsedAt: pk.lastUsedAt,
    }));
  }

  async deletePasskey(id: string, userId: string) {
    const passkey = await this.prisma.passkey.findUnique({ where: { id } });
    if (!passkey || passkey.userId !== userId) {
      throw new BadRequestException('Passkey no encontrada.');
    }

    await this.prisma.passkey.delete({ where: { id } });
    return { message: 'Passkey eliminada.' };
  }

  private async issueFinalTokens(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        memberships: {
          include: { role: true },
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
