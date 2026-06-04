import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService, PASSWORD_POLICY_REGEX } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
})
export class ResetPassword {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    token: [this.route.snapshot.queryParamMap.get('token') ?? '', [Validators.required]],
    password: ['', [Validators.required, Validators.pattern(PASSWORD_POLICY_REGEX)]],
    confirmPassword: ['', [Validators.required]],
  });

  readonly passwordValue = toSignal(this.form.controls.password.valueChanges, { initialValue: '' });

  readonly passwordRules = computed(() => {
    const pw = this.passwordValue();
    return {
      length: pw.length >= 12,
      uppercase: /[A-Z]/.test(pw),
      lowercase: /[a-z]/.test(pw),
      number: /[0-9]/.test(pw),
      special: /[^A-Za-z0-9]/.test(pw),
    };
  });

  submit(): void {
    if (this.loading()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { token, password, confirmPassword } = this.form.getRawValue();
    if (password !== confirmPassword) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.message.set(null);

    this.auth.resetPassword({ token, password }).subscribe({
      next: (response) => {
        this.message.set(response.message);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo restablecer la contraseña.');
        this.loading.set(false);
      },
    });
  }
}
