import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FleetService } from '../../services/fleet.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory.html',
})
export class Inventory {
  protected readonly fleet = inject(FleetService);
  private readonly route = inject(ActivatedRoute);
  readonly query = signal('');
  readonly selectedStatus = signal<'Todos' | 'Protegido' | 'Riesgo' | 'Offline'>('Todos');
  readonly filtersOpen = signal(false);
  readonly expandedDeviceId = signal<number | null>(null);
  readonly statuses = ['Todos', 'Protegido', 'Riesgo', 'Offline'] as const;

  readonly devices = computed(() => {
    const text = this.query().trim().toLowerCase();
    const status = this.selectedStatus();

    return this.fleet.deviceRows().filter((device) => {
      const matchesText =
        !text ||
        device.name.toLowerCase().includes(text) ||
        device.hostname.toLowerCase().includes(text) ||
        device.os.toLowerCase().includes(text);
      const matchesStatus = status === 'Todos' || device.status === status;

      return matchesText && matchesStatus;
    });
  });

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q');
      if (q !== null) {
        this.query.set(q);
      }
    });
  }

  onFilter(event: Event) {
    const target = event.target as HTMLInputElement;
    this.query.set(target.value || '');
  }

  toggleFilters() {
    this.filtersOpen.update((open) => !open);
  }

  setStatus(status: (typeof this.statuses)[number]) {
    this.selectedStatus.set(status);
  }

  toggleDetails(id: number) {
    this.expandedDeviceId.update((current) => (current === id ? null : id));
  }
}
