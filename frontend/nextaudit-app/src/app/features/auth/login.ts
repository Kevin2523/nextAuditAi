import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { WebAuthnService } from '../../services/webauthn.service';

import { OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly webauthn = inject(WebAuthnService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly info = signal<string | null>(null);
  readonly mfaMode = signal(false);
  readonly tempToken = signal<string | null>(null);
  readonly showForgotLink = signal(true);
  readonly hasMfaTotp = signal(false);
  readonly hasPasskeys = signal(false);
  readonly passkeyLoading = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    otp: [''],
  });

  ngOnInit() {
    if (this.route.snapshot.queryParamMap.get('timeout') === 'true') {
      this.error.set('Tu sesión ha expirado por inactividad.');
    }
  }

  submit(): void {
    if (this.loading()) {
      return;
    }

    if (!this.mfaMode() && this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.mfaMode()) {
      const otp = this.form.controls.otp.value.trim();
      if (!/^\d{6}$/.test(otp)) {
        this.error.set('Ingresa un codigo OTP valido de 6 digitos.');
        return;
      }

      const tempToken = this.tempToken();
      if (!tempToken) {
        this.error.set('No se encontro el token temporal de MFA.');
        return;
      }

      this.loading.set(true);
      this.error.set(null);
      this.info.set(null);

      this.auth.verifyMfaLogin({ tempToken, otp }).subscribe({
        next: () => this.navigateToReturnUrl(),
        error: (error: unknown) => this.handleError(error),
      });
      return;
    }

    if (this.form.controls.email.invalid || this.form.controls.password.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.info.set(null);

    const credentials = {
      email: this.form.controls.email.value,
      password: this.form.controls.password.value,
    };

    this.auth.login(credentials).subscribe({
      next: (result) => {
        if (result.kind === 'mfa-required') {
          this.mfaMode.set(true);
          this.tempToken.set(result.tempToken);
          this.hasMfaTotp.set(result.hasMfaTotp);
          this.hasPasskeys.set(result.hasPasskeys);
          this.form.controls.otp.setValue('');
          this.loading.set(false);
          return;
        }

        this.navigateToReturnUrl();
      },
      error: (error: unknown) => this.handleError(error),
    });
  }

  async passkeyMfaLogin(): Promise<void> {
    if (!this.webauthn.isSupported()) {
      this.error.set('Tu navegador no soporta WebAuthn (Face ID / Huella / Passkey).');
      return;
    }

    const currentTempToken = this.tempToken();
    if (!currentTempToken) {
      this.error.set('No se encontro el token temporal de MFA.');
      return;
    }

    this.passkeyLoading.set(true);
    this.error.set(null);
    this.info.set('Esperando verificación biométrica...');

    this.auth.passkeyMfaLoginBegin(currentTempToken).subscribe({
      next: async (beginResponse) => {
        try {
          const authResponse = await this.webauthn.authenticate(beginResponse.options);
          this.auth.passkeyMfaLoginComplete(beginResponse.sessionId, authResponse, currentTempToken).subscribe({
            next: () => {
              this.passkeyLoading.set(false);
              this.navigateToReturnUrl();
            },
            error: (err) => {
              this.passkeyLoading.set(false);
              this.handleError(err);
            },
          });
        } catch (err: unknown) {
          this.passkeyLoading.set(false);
          const msg = err instanceof Error ? err.message : 'Autenticación cancelada.';
          this.error.set(msg);
        }
      },
      error: (err) => {
        this.passkeyLoading.set(false);
        this.handleError(err);
      },
    });
  }

  backToCredentials(): void {
    this.mfaMode.set(false);
    this.tempToken.set(null);
    this.form.controls.otp.setValue('');
    this.error.set(null);
    this.info.set(null);
  }

  private navigateToReturnUrl(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
    this.router.navigateByUrl(returnUrl);
  }

  private handleError(error: unknown): void {
    const response = error instanceof HttpErrorResponse ? error : null;
    if (response?.status === 423) {
      this.error.set('Cuenta bloqueada temporalmente por múltiples intentos fallidos. Espere 15 segundos.');
    } else if (response?.status === 401 && this.mfaMode() && !this.passkeyLoading()) {
      this.error.set('Codigo OTP invalido o expirado.');
    } else if (response?.status === 401 && this.passkeyLoading()) {
      this.error.set('Verificación biométrica fallida. Intenta de nuevo.');
    } else if (response?.status === 400) {
      this.error.set(response.error?.message ?? 'Solicitud invalida.');
    } else {
      this.error.set('Credenciales invalidas o servicio no disponible.');
    }
    this.loading.set(false);
  }
}
