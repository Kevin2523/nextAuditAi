import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { FleetService } from '../../services/fleet.service';

@Component({
  selector: 'app-fleet-access-console',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fleet-access-console.html',
  styleUrl: './fleet-access-console.css',
})
export class FleetAccessConsoleComponent {
  protected readonly fleet = inject(FleetService);

  readonly email = signal('');
  readonly password = signal('');
  readonly submitting = signal(false);
  readonly uiError = signal<string | null>(null);
  readonly uiMessage = signal<string | null>(null);

  readonly tokenPreview = computed(() => {
    const token = this.fleet.token();
    if (!token) {
      return 'No token loaded';
    }

    return `${token.slice(0, 16)}...${token.slice(-8)}`;
  });

  login() {
    const email = this.email().trim();
    const password = this.password().trim();

    this.uiError.set(null);
    this.uiMessage.set(null);

    if (!email || !password) {
      this.uiError.set('Email and password are required.');
      return;
    }

    this.submitting.set(true);

    this.fleet
      .login({ email, password })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.uiMessage.set('Link-up complete. Fleet token secured in signal memory.');
          this.password.set('');
        },
        error: (error: unknown) => {
          const message = error instanceof Error ? error.message : 'Fleet login failed.';
          this.uiError.set(message);
        },
      });
  }

  forceSync() {
    this.fleet.refresh();
  }

  clearToken() {
    this.fleet.logout();
    this.uiMessage.set('Session purged. Token buffer cleared.');
  }
}
