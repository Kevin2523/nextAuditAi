import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertsService } from '../../services/alerts.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.css',
})
export class AuditoriaComponent {
  protected readonly alerts = inject(AlertsService);

  formatDate(isoString: string): string {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  }

  hostName(hostname?: string | null, deviceId?: string | null): string {
    return hostname || deviceId || 'Dispositivo no identificado';
  }
}
