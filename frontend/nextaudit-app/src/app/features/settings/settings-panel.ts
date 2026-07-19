import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, MfaSetupResponse, PasskeyInfo } from '../../services/auth.service';
import { WebAuthnService } from '../../services/webauthn.service';

type Tab = 'cuenta' | 'seguridad';

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-panel.html',
})
export class SettingsPanel {
  protected readonly auth = inject(AuthService);
  protected readonly webauthn = inject(WebAuthnService);
  protected readonly router = inject(Router);

  readonly activeTab = signal<Tab>('cuenta');

  readonly profileDisplayName = signal('');
  readonly profileEmail = signal('');
  readonly profileCurrentPassword = signal('');
  readonly profileSaving = signal(false);
  readonly profileError = signal<string | null>(null);
  readonly profileMessage = signal<string | null>(null);

  readonly passwordCurrentPassword = signal('');
  readonly passwordNewPassword = signal('');
  readonly passwordConfirm = signal('');
  readonly passwordSaving = signal(false);
  readonly passwordError = signal<string | null>(null);
  readonly passwordMessage = signal<string | null>(null);

  readonly mfaSetup = signal<MfaSetupResponse | null>(null);
  readonly mfaOtp = signal('');
  readonly mfaLoading = signal(false);
  readonly mfaError = signal<string | null>(null);
  readonly mfaMessage = signal<string | null>(null);

  readonly passkeys = signal<PasskeyInfo[]>([]);
  readonly passkeyLoading = signal(false);
  readonly passkeyError = signal<string | null>(null);
  readonly passkeyMessage = signal<string | null>(null);

  constructor() {
    this.loadPasskeys();
    this.profileDisplayName.set(this.auth.currentUserSignal()?.displayName ?? '');
    this.profileEmail.set(this.auth.currentUserSignal()?.email ?? '');
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    if (tab === 'seguridad') {
      this.loadPasskeys();
    }
  }

  saveProfile(): void {
    const displayName = this.profileDisplayName().trim();
    const email = this.profileEmail().trim();
    const currentPassword = this.profileCurrentPassword();

    if (!displayName && !email) {
      this.profileError.set('Debes proporcionar al menos un nombre o correo.');
      return;
    }
    if (!currentPassword) {
      this.profileError.set('Debes ingresar tu contraseña actual para guardar cambios.');
      return;
    }

    this.profileSaving.set(true);
    this.profileError.set(null);
    this.profileMessage.set(null);

    this.auth.updateProfile({ displayName, email, currentPassword }).subscribe({
      next: (response) => {
        this.profileSaving.set(false);
        this.profileCurrentPassword.set('');
        if (response.reauthenticate) {
          this.profileMessage.set('Correo actualizado. Debes volver a iniciar sesión para que los cambios surtan efecto.');
          this.profileError.set(null);
          this.auth.logout();
          this.router.navigate(['/login']);
        } else {
          this.profileMessage.set('Perfil actualizado correctamente.');
          this.profileError.set(null);
        }
      },
      error: (err) => {
        this.profileSaving.set(false);
        this.profileError.set(err.error?.message || 'Error al actualizar el perfil.');
        this.profileMessage.set(null);
      },
    });
  }

  savePassword(): void {
    const currentPassword = this.passwordCurrentPassword();
    const newPassword = this.passwordNewPassword();
    const confirm = this.passwordConfirm();

    if (!currentPassword || !newPassword || !confirm) {
      this.passwordError.set('Completa todos los campos.');
      return;
    }
    if (newPassword !== confirm) {
      this.passwordError.set('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (newPassword.length < 12) {
      this.passwordError.set('La contraseña debe tener al menos 12 caracteres.');
      return;
    }

    this.passwordSaving.set(true);
    this.passwordError.set(null);
    this.passwordMessage.set(null);

    this.auth.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.passwordSaving.set(false);
        this.passwordCurrentPassword.set('');
        this.passwordNewPassword.set('');
        this.passwordConfirm.set('');
        this.passwordMessage.set('Contraseña actualizada. Debes volver a iniciar sesión.');
        this.auth.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.passwordSaving.set(false);
        this.passwordError.set(err.error?.message || 'Error al cambiar la contraseña.');
        this.passwordMessage.set(null);
      },
    });
  }

  startMfaSetup(): void {
    this.mfaLoading.set(true);
    this.mfaError.set(null);
    this.mfaMessage.set(null);

    this.auth.generateMfa().subscribe({
      next: (response) => {
        this.mfaSetup.set(response);
        this.mfaLoading.set(false);
        this.mfaMessage.set('Escanea el código QR con tu app de autenticación.');
      },
      error: () => {
        this.mfaError.set('No se pudo generar el secreto MFA.');
        this.mfaLoading.set(false);
      },
    });
  }

  enableMfa(): void {
    const otp = this.mfaOtp().trim();
    if (!/^\d{6}$/.test(otp)) {
      this.mfaError.set('El código OTP debe tener 6 dígitos.');
      return;
    }

    this.mfaLoading.set(true);
    this.mfaError.set(null);

    this.auth.enableMfa({ otp }).subscribe({
      next: () => {
        this.mfaMessage.set('MFA activado correctamente.');
        this.mfaLoading.set(false);
      },
      error: () => {
        this.mfaError.set('No se pudo activar MFA.');
        this.mfaLoading.set(false);
      },
    });
  }

  disableMfa(): void {
    this.mfaLoading.set(true);
    this.mfaError.set(null);
    this.mfaMessage.set(null);

    this.auth.disableMfa().subscribe({
      next: () => {
        this.mfaMessage.set('MFA ha sido desactivado exitosamente.');
        this.mfaLoading.set(false);
      },
      error: () => {
        this.mfaError.set('No se pudo desactivar MFA.');
        this.mfaLoading.set(false);
      },
    });
  }

  loadPasskeys(): void {
    this.auth.listPasskeys().subscribe({
      next: (keys) => this.passkeys.set(keys),
      error: () => this.passkeys.set([]),
    });
  }

  async registerPasskey(authenticatorAttachment: 'platform' | 'cross-platform', deviceName?: string): Promise<void> {
    if (!this.webauthn.isSupported()) {
      this.passkeyError.set('Tu navegador no soporta WebAuthn.');
      return;
    }

    this.passkeyLoading.set(true);
    this.passkeyError.set(null);
    this.passkeyMessage.set(null);

    this.auth.passkeyRegisterBegin(deviceName, authenticatorAttachment).subscribe({
      next: async (beginResponse) => {
        try {
          const regResponse = await this.webauthn.register(beginResponse.options);
          this.auth.passkeyRegisterComplete(beginResponse.sessionId, regResponse, deviceName).subscribe({
            next: () => {
              this.passkeyMessage.set('Passkey registrada exitosamente.');
              this.passkeyLoading.set(false);
              this.loadPasskeys();
            },
            error: () => {
              this.passkeyError.set('Error al completar el registro de passkey.');
              this.passkeyLoading.set(false);
            },
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Registro cancelado por el usuario.';
          this.passkeyError.set(msg);
          this.passkeyLoading.set(false);
        }
      },
      error: () => {
        this.passkeyError.set('Error al iniciar el registro de passkey.');
        this.passkeyLoading.set(false);
      },
    });
  }

  deletePasskey(id: string): void {
    this.auth.deletePasskey(id).subscribe({
      next: () => {
        this.passkeyMessage.set('Passkey eliminada.');
        this.loadPasskeys();
      },
      error: () => {
        this.passkeyError.set('Error al eliminar la passkey.');
      },
    });
  }
}
