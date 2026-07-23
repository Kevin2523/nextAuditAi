import { Component, OnInit, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SecurityDemoService, SecurityDemoStatus } from '../../services/security-demo.service';

export interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'system' | 'separator';
}

@Component({
  selector: 'app-security-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './security-demo.html',
  styleUrls: ['./security-demo.css'],
})
export class SecurityDemo implements OnInit, AfterViewChecked {
  @ViewChild('terminalOutput') terminalOutput!: ElementRef;
  @ViewChild('terminalInput') terminalInput!: ElementRef;

  readonly status = signal<SecurityDemoStatus | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly autoRefresh = signal(true);
  readonly commandInput = signal('');
  readonly terminalLines = signal<TerminalLine[]>([
    { text: 'NextAudit Security Console v1.0', type: 'system' },
    { text: 'Escribe "help" para ver los comandos disponibles.', type: 'system' },
    { text: '', type: 'separator' },
  ]);
  readonly commandHistory = signal<string[]>([]);
  private historyIndex = -1;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  readonly quickCommands = ['help', 'status', 'logs 10', 'check:waf', 'check:db', 'check:fim', 'check:ids', 'check:prisma', 'clear'];

  constructor(private readonly demoService: SecurityDemoService) {}

  ngOnInit(): void {
    this.loadStatus();
    this.refreshTimer = setInterval(() => {
      if (this.autoRefresh()) this.loadStatus();
    }, 30_000);
  }

  ngAfterViewChecked(): void {
    this.scrollTerminalBottom();
  }

  async loadStatus(): Promise<void> {
    try {
      this.error.set(null);
      const data = await this.demoService.getStatus();
      this.status.set(data);
    } catch {
      this.error.set('No se pudo cargar el estado de las herramientas de seguridad.');
    } finally {
      this.loading.set(false);
    }
  }

  refreshNow(): void {
    this.loading.set(true);
    this.loadStatus();
  }

  toggleAutoRefresh(): void {
    this.autoRefresh.update((v) => !v);
  }

  // Terminal methods

  focusInput(): void {
    setTimeout(() => this.terminalInput?.nativeElement?.focus(), 50);
  }

  onTerminalKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.runCommand();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const history = this.commandHistory();
      if (history.length === 0) return;
      this.historyIndex = Math.min(this.historyIndex + 1, history.length - 1);
      this.commandInput.set(history[history.length - 1 - this.historyIndex]);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.historyIndex <= 0) {
        this.historyIndex = -1;
        this.commandInput.set('');
        return;
      }
      this.historyIndex--;
      const history = this.commandHistory();
      this.commandInput.set(history[history.length - 1 - this.historyIndex]);
      return;
    }
  }

  async runCommand(): Promise<void> {
    const cmd = this.commandInput().trim();
    if (!cmd) return;

    this.terminalLines.update((lines) => [...lines, { text: `$ ${cmd}`, type: 'input' }]);
    this.commandInput.set('');

    if (cmd.toLowerCase() === 'clear') {
      this.terminalLines.set([]);
      this.focusInput();
      return;
    }

    this.commandHistory.update((h) => [...h, cmd]);
    this.historyIndex = -1;

    try {
      if (cmd.toLowerCase() === 'status') {
        const data = await this.demoService.getStatus();
        const lines = this.formatStatusOutput(data);
        this.terminalLines.update((prev) => [...prev, ...lines]);
      } else {
        const res = await this.demoService.executeCommand(cmd);
        const outputLines = res.output.split('\n').map((line) => ({
          text: line,
          type: 'output' as const,
        }));
        this.terminalLines.update((prev) => [...prev, ...outputLines]);
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'error' in err
        ? (err as { error: { message: string } }).error?.message || 'Error desconocido'
        : 'Error de conexión con el servidor.';
      this.terminalLines.update((prev) => [...prev, { text: `❌ ${msg}`, type: 'error' }]);
    }

    this.terminalLines.update((prev) => [...prev, { text: '', type: 'separator' }]);
    this.focusInput();
  }

  async runQuickCommand(cmd: string): Promise<void> {
    this.commandInput.set(cmd);
    await this.runCommand();
  }

  private formatStatusOutput(data: SecurityDemoStatus): TerminalLine[] {
    return [
      { text: '╔═══ ESTADO DE SEGURIDAD ═══╗', type: 'system' },
      { text: '', type: 'separator' },
      { text: `  WAF:           ${data.waf.rulesCount} reglas activas, ${data.waf.recentBlocks} bloqueos`, type: 'output' },
      { text: `  IDS/IPS:       ${data.ids.trackedIps} IPs monitoreadas, ${data.ids.blockedIps} bloqueadas`, type: 'output' },
      { text: `  FIM:           ${data.fim.monitoredFiles} archivos monitoreados (${data.fim.integrityStatus})`, type: 'output' },
      { text: `  Rate Limiting: Corto ${data.rateLimiting.short.limit}req/${data.rateLimiting.short.ttl} · Medio ${data.rateLimiting.medium.limit}req/${data.rateLimiting.medium.ttl} · Largo ${data.rateLimiting.long.limit}req/${data.rateLimiting.long.ttl}`, type: 'output' },
      { text: `  Helmet/CSP:    ${data.helmet.csp ? '✅' : '❌'} CSP · ${data.helmet.hsts ? '✅' : '❌'} HSTS · XFrame: ${data.helmet.xframe}`, type: 'output' },
      { text: '', type: 'separator' },
      { text: `  Últimos eventos: ${data.recentEvents.length} registrados`, type: 'output' },
    ];
  }

  private scrollTerminalBottom(): void {
    try {
      if (this.terminalOutput?.nativeElement) {
        this.terminalOutput.nativeElement.scrollTop = this.terminalOutput.nativeElement.scrollHeight;
      }
    } catch {
      // silent
    }
  }

  getSeverityIcon(sev: string): string {
    if (sev === 'critical' || sev === 'high') return '🔴';
    if (sev === 'warn' || sev === 'warning') return '🟡';
    if (sev === 'error') return '❌';
    if (sev === 'info') return '🔵';
    return '🟢';
  }

  eventIcon(event: string): string {
    if (event.includes('LOGIN_SUCCESS') || event.includes('MFA_ENABLED')) return '✅';
    if (event.includes('LOGIN_FAILED') || event.includes('LOGIN_LOCKED')) return '⚠️';
    if (event.includes('WAF_BLOCKED')) return '🚫';
    if (event.includes('IDS_DETECTED')) return '⛔';
    if (event.includes('FIM_CHANGE')) return '🔴';
    if (event.includes('MFA_DISABLED')) return '🔵';
    if (event.includes('PASSWORD_CHANGED') || event.includes('PASSWORD_RESET')) return '🔑';
    if (event.includes('WEBHOOK')) return '🔗';
    return '📋';
  }

  eventColor(event: string): string {
    if (event.includes('WAF_BLOCKED') || event.includes('FIM_CHANGE') || event.includes('IDS_DETECTED')) return 'text-red-600';
    if (event.includes('LOGIN_FAILED') || event.includes('LOGIN_LOCKED') || event.includes('WEBHOOK_REJECTED')) return 'text-amber-600';
    if (event.includes('LOGIN_SUCCESS') || event.includes('MFA_ENABLED')) return 'text-emerald-600';
    return 'text-slate-600';
  }
}
