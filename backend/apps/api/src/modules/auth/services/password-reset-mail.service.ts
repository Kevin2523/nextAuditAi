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

    const htmlTemplate = `
      <div style="font-family: 'Inter', Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px; border-radius: 8px; border: 1px solid #E2E8F0;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0F172A; font-size: 24px; margin: 0;">NextAudit AI</h1>
          <p style="color: #64748B; font-size: 14px; margin-top: 5px;">Plataforma de Seguridad y Auditoría</p>
        </div>
        
        <div style="background-color: #F8FAFC; padding: 24px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #0F172A; font-size: 18px; margin-top: 0;">Restablecimiento de Contraseña</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">
            Hola,<br><br>
            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en NextAudit AI. Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563EB; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">Restablecer Contraseña</a>
          </div>
          <p style="color: #64748B; font-size: 13px; margin-bottom: 0;">
            Por razones de seguridad, este enlace expirará en <strong>15 minutos</strong>.
          </p>
        </div>
        
        <div style="border-top: 1px solid #E2E8F0; padding-top: 20px; text-align: center;">
          <p style="color: #94A3B8; font-size: 12px; margin: 0;">
            Si tienes problemas con el botón, copia y pega este enlace en tu navegador:<br>
            <a href="${resetUrl}" style="color: #2563EB; word-break: break-all;">${resetUrl}</a>
          </p>
          <p style="color: #94A3B8; font-size: 12px; margin-top: 15px;">
            &copy; ${new Date().getFullYear()} NextAudit AI. Todos los derechos reservados.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from,
      to: payload.email,
      subject: 'Restablecer contraseña - NextAudit AI',
      text: `Usa este enlace para restablecer tu contraseña: ${resetUrl}`,
      html: htmlTemplate,
    });
  }

  private buildResetUrl(resetToken: string): string {
    const publicUrl = process.env.APP_PUBLIC_URL ?? 'http://localhost:4200';
    const url = new URL('/reset-password', publicUrl);
    url.searchParams.set('token', resetToken);
    return url.toString();
  }
}
