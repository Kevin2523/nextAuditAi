import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FleetService } from '../../services/fleet.service';
import { ActivityService } from '../../services/activity.service';

interface WeeklySecurityPoint {
  label: string;
  total: number;
  successful: number;
  score: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly fleet = inject(FleetService);
  protected readonly activity = inject(ActivityService);

  readonly metrics = computed(() => [
    {
      label: 'Puntuacion de Cumplimiento',
      value: `${this.fleet.fleetHealth()}%`,
      trend: `${this.fleet.onlineHosts()}/${this.fleet.totalHosts()} online`,
      up: true,
      icon: 'shield-check',
      color: 'primary',
    },
    {
      label: 'Salud de Flota',
      value: `${this.fleet.totalHosts()}`,
      trend: this.fleet.isOffline() ? 'Fleet offline' : `${this.fleet.onlineHosts()} conectados`,
      up: !this.fleet.isOffline(),
      icon: 'laptop',
      color: 'success',
    },
    {
      label: 'Incidentes Detectados',
      value: `${this.fleet.vulnerabilityCount()}`,
      trend: 'Vulnerabilidades activas',
      up: this.fleet.vulnerabilityCount() === 0,
      icon: 'wrench',
      color: 'warning',
    },
    {
      label: 'Remediaciones Exitosas',
      value: `${this.successfulRemediations()}`,
      trend: 'Sincronizado con n8n',
      up: true,
      icon: 'calendar',
      color: 'info',
    },
  ]);

  readonly recentIssues = computed(() =>
    this.activity.logs().slice(0, 3).map((log) => ({
      text: `${log.tipo_suceso} en ${log.dispositivo_afectado}`,
      status: log.estado_resolucion === 'exitoso' ? 'success' : 'warning',
      time: log.relativeTime,
    })),
  );

  readonly successfulRemediations = computed(
    () => this.activity.logs().filter((log) => log.estado_resolucion === 'exitoso').length,
  );

  readonly weeklySecurity = computed<WeeklySecurityPoint[]>(() => {
    const today = this.startOfDay(new Date());
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return date;
    });

    const logs = this.activity.logs();
    const lastIndex = days.length - 1;

    return days.map((date, index) => {
      const dayLogs = logs.filter((log) => this.isSameDay(new Date(log.occurredAt), date));
      const successful = dayLogs.filter((log) => log.estado_resolucion === 'exitoso').length;
      const score = dayLogs.length === 0 ? 0 : Math.round((successful / dayLogs.length) * 100);

      return {
        label: this.dayLabel(date),
        total: dayLogs.length,
        successful,
        score,
        x: lastIndex === 0 ? 0 : Math.round((index / lastIndex) * 1000),
        y: Math.round(200 - score * 2),
      };
    });
  });

  readonly weeklySecurityWithData = computed(() => this.weeklySecurity().filter((point) => point.total > 0));
  readonly hasWeeklySecurityData = computed(() => this.weeklySecurityWithData().length > 0);
  readonly weeklyLinePoints = computed(() =>
    this.weeklySecurityWithData()
      .map((point) => `${point.x},${point.y}`)
      .join(' '),
  );
  readonly weeklyAreaPoints = computed(() => {
    const points = this.weeklySecurityWithData();
    if (points.length === 0) return '';

    return `0,200 ${points.map((point) => `${point.x},${point.y}`).join(' ')} 1000,200`;
  });

  downloadReport() {
    const generatedAt = new Date().toISOString();
    const lines = [
      'NextAudit AI - Reporte operativo',
      `Generado,${generatedAt}`,
      '',
      'Metrica,Valor',
      `Hosts totales,${this.fleet.totalHosts()}`,
      `Hosts online,${this.fleet.onlineHosts()}`,
      `Salud de flota,${this.fleet.fleetHealth()}%`,
      `Vulnerabilidades activas,${this.fleet.vulnerabilityCount()}`,
      `Remediaciones exitosas,${this.successfulRemediations()}`,
      '',
      'Actividad reciente,Dispositivo,Estado,Fecha',
      ...this.activity.logs().map((log) =>
        [
          this.csv(log.tipo_suceso),
          this.csv(log.dispositivo_afectado),
          this.csv(log.estado_resolucion),
          this.csv(log.timestamp),
        ].join(','),
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nextaudit-reporte-${generatedAt.slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private csv(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private isSameDay(left: Date, right: Date): boolean {
    return (
      left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate()
    );
  }

  private dayLabel(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(date).replace('.', '');
  }
}
