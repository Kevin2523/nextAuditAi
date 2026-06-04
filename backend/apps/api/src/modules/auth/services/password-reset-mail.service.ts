import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface PasswordResetMailPayload {
  email: string;
  resetToken: string;
}

@Injectable()
export class PasswordResetMailService {
  private readonly logger = new Logger(PasswordResetMailService.name);

  async sendResetLink(payload: PasswordResetMailPayload): Promise<void> {
    const resetUrl = this.buildResetUrl(payload.resetToken);
    const host = process.env.SMTP_HOST;
    const from = process.env.SMTP_FROM;

    if (!host || !from) {
      this.logger.warn('SMTP no configurado. No se envio correo de recuperacion.');
      this.logger.warn(`URL temporal de desarrollo: ${resetUrl}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    });

    await transporter.sendMail({
      from,
      to: payload.email,
      subject: 'Restablecer contrasena - NextAudit AI',
      text: `Usa este enlace para restablecer tu contrasena: ${resetUrl}`,
      html: `
        <p>Solicitaste restablecer tu contrasena en NextAudit AI.</p>
        <p><a href="${resetUrl}">Restablecer contrasena</a></p>
        <p>Este enlace expira en 15 minutos.</p>
      `,
    });
  }

  private buildResetUrl(resetToken: string): string {
    const publicUrl = process.env.APP_PUBLIC_URL ?? 'http://localhost:4200';
    const url = new URL('/reset-password', publicUrl);
    url.searchParams.set('token', resetToken);
    return url.toString();
  }
}
