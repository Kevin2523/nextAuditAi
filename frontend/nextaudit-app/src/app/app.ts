import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { IdleTimeoutService } from './services/idle-timeout.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class App {
  constructor() {
    inject(AuthService);
    const idleService = inject(IdleTimeoutService);
    idleService.startMonitoring();
  }
}
