import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService, MfaSetupResponse, PasskeyInfo, PASSWORD_POLICY_REGEX } from '../../services/auth.service';
import { WebAuthnService } from '../../services/webauthn.service';
import { SecurityDemo } from './security-demo';

type Tab = 'cuenta' | 'seguridad' | 'demostracion';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPw = control.get('newPassword');
  const confirm = control.get('confirmPassword');
  if (!newPw || !confirm || !newPw.value || !confirm.value) return null;
  return newPw.value !== confirm.value ? { mismatch: true } : null;
}

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SecurityDemo],
  templateUrl: './settings-panel.html',
})
export class SettingsPanel {
  protected readonly auth = inject(AuthService);
  protected readonly webauthn = inject(WebAuthnService);
  protected readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly activeTab = signal<Tab>('cuenta');

  readonly profileForm = this.fb.nonNullable.group({
    displayName: [''],
    email: ['', Validators.email],
    currentPassword: ['', Validators.required],
  });

  readonly profileSaving = signal(false);
  readonly profileError = signal<string | null>(null);
  readonly profileMessage = signal<string | null>(null);

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.pattern(PASSWORD_POLICY_REGEX)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatchValidator });

  readonly passwordSaving = signal(false);
  readonly passwordError = signal<string | null>(null);
  readonly passwordMessage = signal<string | null>(null);

  readonly passwordRules = signal({ length: false, uppercase: false, lowercase: false, number: false, special: false });

  readonly mfaForm = this.fb.nonNullable.group({
    otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  readonly mfaSetup = signal<MfaSetupResponse | null>(null);
  readonly mfaLoading = signal(false);
  readonly mfaError = signal<string | null>(null);
  readonly mfaMessage = signal<string | null>(null);

  readonly passkeys = signal<PasskeyInfo[]>([]);
  readonly passkeyLoading = signal(false);
  readonly passkeyError = signal<string | null>(null);
  readonly passkeyMessage = signal<string | null>(null);

  constructor() {
    this.loadPasskeys();
    const user = this.auth.currentUserSignal();
    this.profileForm.patchValue({
      displayName: user?.displayName ?? '',
      email: user?.email ?? '',
    });

    this.passwordForm.get('newPassword')?.valueChanges.subscribe(pw => {
      this.passwordRules.set({
        length: (pw ?? '').length >= 12,
        uppercase: /[A-Z]/.test(pw ?? ''),
        lowercase: /[a-z]/.test(pw ?? ''),
        number: /[0-9]/.test(pw ?? ''),
        special: /[^A-Za-z0-9]/.test(pw ?? ''),
      });
    });
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    if (tab === 'seguridad') {
      this.loadPasskeys();
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const displayName = (this.profileForm.value.displayName ?? '').trim();
    const email = (this.profileForm.value.email ?? '').trim();
    const currentPassword = this.profileForm.value.currentPassword ?? '';

    if (!displayName && !email) {
      this.profileError.set('Debes proporcionar al menos un nombre o correo.');
      return;
    }

    this.profileSaving.set(true);
    this.profileError.set(null);
    this.profileMessage.set(null);

    this.auth.updateProfile({ displayName, email, currentPassword }).subscribe({
      next: (response) => {
        this.profileSaving.set(false);
        this.profileForm.patchValue({ currentPassword: '' });
        if (response.reauthenticate) {
          this.profileMessage.set('Correo actualizado. Debes volver a iniciar sesión para que los cambios surtan efecto.');
          this.auth.logout();
          this.router.navigate(['/login']);
        } else {
          this.profileMessage.set('Perfil actualizado correctamente.');
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
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    if (this.passwordForm.hasError('mismatch')) {
      this.passwordError.set('Las contraseñas nuevas no coinciden.');
      return;
    }

    const currentPassword = this.passwordForm.value.currentPassword ?? '';
    const newPassword = this.passwordForm.value.newPassword ?? '';

    this.passwordSaving.set(true);
    this.passwordError.set(null);
    this.passwordMessage.set(null);

    this.auth.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.passwordSaving.set(false);
        this.passwordForm.reset();
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
    if (this.mfaForm.invalid) {
      this.mfaForm.markAllAsTouched();
      return;
    }

    const otp = this.mfaForm.value.otp ?? '';

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
