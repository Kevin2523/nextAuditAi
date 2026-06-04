import { Injectable, inject, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class IdleTimeoutService implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  // 10 minutos de inactividad
  private readonly TIMEOUT_MS = 10 * 60 * 1000;
  private timeoutId: any;
  private isListening = false;

  private readonly activityEvents = [
    'mousemove',
    'keydown',
    'click',
    'scroll',
    'touchstart'
  ];

  constructor() {
    this.resetTimer = this.resetTimer.bind(this);
  }

  startMonitoring() {
    if (this.isListening) return;

    this.ngZone.runOutsideAngular(() => {
      this.activityEvents.forEach(event => {
        window.addEventListener(event, this.resetTimer, { passive: true });
      });
    });

    this.isListening = true;
    this.startTimer();
  }

  stopMonitoring() {
    if (!this.isListening) return;

    this.activityEvents.forEach(event => {
      window.removeEventListener(event, this.resetTimer);
    });

    this.clearTimer();
    this.isListening = false;
  }

  private resetTimer() {
    this.clearTimer();
    this.startTimer();
  }

  private startTimer() {
    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          this.handleTimeout();
        });
      }, this.TIMEOUT_MS);
    });
  }

  private clearTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private handleTimeout() {
    if (this.auth.currentUserSignal() || this.auth.accessToken()) {
      this.auth.logout();
      this.stopMonitoring();
      this.router.navigate(['/login'], { queryParams: { timeout: 'true' } });
    }
  }

  ngOnDestroy() {
    this.stopMonitoring();
  }
}
