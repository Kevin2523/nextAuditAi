import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FleetService } from '../../services/fleet.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.css',
})
export class AuditoriaComponent {
  protected readonly fleet = inject(FleetService);

  formatDate(isoString: string): string {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  }
}
