import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityLog, ActivityService } from '../../services/activity.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.html',
})
export class History {
  private readonly activity = inject(ActivityService);

  readonly logs$ = this.activity.logs$;
  readonly autoHealingFeed$ = this.activity.autoHealingFeed$;
  readonly isOffline = this.activity.isOffline;

  trackById(_: number, log: { id: string }) {
    return log.id;
  }

  downloadCertificate(log: ActivityLog) {
    const content = [
      'NextAudit AI - Certificado de Resolucion',
      `ID de ejecucion: ${log.id}`,
      `Suceso: ${log.tipo_suceso}`,
      `Dispositivo: ${log.dispositivo_afectado}`,
      `Estado: ${log.estado_resolucion}`,
      `Fecha: ${log.timestamp}`,
      '',
      'Este certificado se genera exclusivamente con la ejecucion real registrada por n8n.',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nextaudit-certificado-${log.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
