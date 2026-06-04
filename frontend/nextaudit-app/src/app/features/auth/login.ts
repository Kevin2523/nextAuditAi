import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly info = signal<string | null>(null);
  readonly mfaMode = signal(false);
  readonly tempToken = signal<string | null>(null);
  readonly showForgotLink = signal(true);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    otp: [''],
  });

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
          this.form.controls.otp.setValue('');
          this.info.set('Se requiere verificacion MFA. Ingresa el codigo OTP de 6 digitos.');
          this.loading.set(false);
          return;
        }

        this.navigateToReturnUrl();
      },
      error: (error: unknown) => this.handleError(error),
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
    } else if (response?.status === 401 && this.mfaMode()) {
      this.error.set('Codigo OTP invalido o expirado.');
    } else {
      this.error.set('Credenciales invalidas o servicio no disponible.');
    }
    this.loading.set(false);
  }
}
