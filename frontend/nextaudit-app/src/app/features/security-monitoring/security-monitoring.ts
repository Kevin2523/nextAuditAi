import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SecurityMonitoringService,
  WafRule,
  WafStats,
  IdsSignature,
  IdsSignaturesResponse,
  IdsStats,
  SecurityLogEntry,
  SummaryResponse,
  WafTestResult,
} from '../../services/security-monitoring.service';

type Tab = 'waf' | 'ids' | 'siem';

@Component({
  selector: 'app-security-monitoring',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './security-monitoring.html',
  styleUrls: ['./security-monitoring.css'],
})
export class SecurityMonitoring implements OnInit, OnDestroy {
  readonly activeTab = signal<Tab>('waf');
  readonly loading = signal(false);

  readonly wafRules = signal<WafRule[]>([]);
  readonly wafStats = signal<WafStats | null>(null);

  readonly idsSignatures = signal<IdsSignaturesResponse | null>(null);
  readonly idsStats = signal<IdsStats | null>(null);

  readonly logs = signal<SecurityLogEntry[]>([]);
  readonly logsTotal = signal(0);
  readonly summary = signal<SummaryResponse | null>(null);

  readonly filterEvent = signal('');
  readonly filterSeverity = signal('');
  readonly filterIp = signal('');
  readonly filterEmail = signal('');
  readonly logOffset = signal(0);
  readonly logLimit = 50;

  readonly testPayload = signal('');
  readonly testResult = signal<WafTestResult | null>(null);
  readonly testLoading = signal(false);

  readonly presetPayloads = [
    { name: 'SQL Injection', value: "' OR 1=1 --" },
    { name: 'XSS', value: '<script>alert("xss")</script>' },
    { name: 'Path Traversal', value: '../../../etc/passwd' },
    { name: 'Command Injection', value: '; rm -rf /' },
  ];

  readonly Math = Math;
  readonly JSON = JSON;

  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly service: SecurityMonitoringService) {}

  ngOnInit(): void {
    this.loadTabData();
    this.timer = setInterval(() => {
      if (this.activeTab() === 'siem') this.loadSiemData();
    }, 10_000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    this.loadTabData();
    if (this.timer) clearInterval(this.timer);
    if (tab === 'siem') {
      this.timer = setInterval(() => this.loadSiemData(), 10_000);
    }
  }

  private loadTabData(): void {
    const tab = this.activeTab();
    if (tab === 'waf') this.loadWafData();
    else if (tab === 'ids') this.loadIdsData();
    else if (tab === 'siem') this.loadSiemData();
  }

  private async loadWafData(): Promise<void> {
    this.loading.set(true);
    try {
      const [rules, stats] = await Promise.all([
        this.service.getWafRules(),
        this.service.getWafStats(),
      ]);
      this.wafRules.set(rules);
      this.wafStats.set(stats);
    } catch {
      this.wafRules.set([]);
      this.wafStats.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadIdsData(): Promise<void> {
    this.loading.set(true);
    try {
      const [signatures, stats] = await Promise.all([
        this.service.getIdsSignatures(),
        this.service.getIdsStats(),
      ]);
      this.idsSignatures.set(signatures);
      this.idsStats.set(stats);
    } catch {
      this.idsSignatures.set(null);
      this.idsStats.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async loadSiemData(): Promise<void> {
    try {
      const [logsRes, summaryRes] = await Promise.all([
        this.service.getLogs({
          event: this.filterEvent() || undefined,
          severity: this.filterSeverity() || undefined,
          ip: this.filterIp() || undefined,
          email: this.filterEmail() || undefined,
          limit: this.logLimit,
          offset: this.logOffset(),
        }),
        this.service.getSummary(),
      ]);
      this.logs.set(logsRes.logs);
      this.logsTotal.set(logsRes.total);
      this.summary.set(summaryRes);
    } catch {
      this.logs.set([]);
      this.logsTotal.set(0);
    }
  }

  applyFilters(): void {
    this.logOffset.set(0);
    this.loadSiemData();
  }

  clearFilters(): void {
    this.filterEvent.set('');
    this.filterSeverity.set('');
    this.filterIp.set('');
    this.filterEmail.set('');
    this.logOffset.set(0);
    this.loadSiemData();
  }

  nextPage(): void {
    this.logOffset.update((o) => o + this.logLimit);
    this.loadSiemData();
  }

  prevPage(): void {
    this.logOffset.update((o) => Math.max(0, o - this.logLimit));
    this.loadSiemData();
  }

  async runTestPayload(payload: string): Promise<void> {
    this.testPayload.set(payload);
    this.testLoading.set(true);
    this.testResult.set(null);
    try {
      const result = await this.service.testWafPayload(payload);
      this.testResult.set(result);
    } catch {
      this.testResult.set({ blocked: false, reason: 'Error al conectar con el servidor', rule: null, severity: null });
    } finally {
      this.testLoading.set(false);
    }
  }

  severityBadge(sev: string): string {
    switch (sev) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'info': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }

  eventIcon(event: string): string {
    if (event.includes('WAF_BLOCKED')) return '🚫';
    if (event.includes('IDS_DETECTED')) return '⛔';
    if (event.includes('FIM_CHANGE')) return '🔴';
    if (event.includes('LOGIN_SUCCESS')) return '✅';
    if (event.includes('LOGIN_FAILED')) return '⚠️';
    if (event.includes('LOGIN_LOCKED')) return '🔒';
    if (event.includes('MFA_ENABLED')) return '🔐';
    if (event.includes('MFA_DISABLED')) return '🔓';
    if (event.includes('PASSWORD_CHANGED')) return '🔑';
    if (event.includes('PASSWORD_RESET')) return '📧';
    return '📋';
  }

  formatMs(ms: number): string {
    if (ms >= 3600000) return `${ms / 3600000}h`;
    if (ms >= 60000) return `${ms / 60000}min`;
    return `${ms / 1000}s`;
  }
}
