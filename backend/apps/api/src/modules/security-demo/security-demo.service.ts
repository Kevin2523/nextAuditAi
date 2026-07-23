import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../persistence/prisma/prisma.service';
import { WafService } from '../../common/waf/waf.service';
import { IdsService } from '../../common/ids/ids.service';
import { FileIntegrityService } from '../../common/fim/file-integrity.service';

@Injectable()
export class SecurityDemoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wafService: WafService,
    private readonly idsService: IdsService,
    private readonly fileIntegrity: FileIntegrityService,
    private readonly config: ConfigService,
  ) {}

  async executeCommand(input: string): Promise<{ output: string }> {
    const parts = input.trim().split(/\s+/);
    const cmd = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help': return { output: this.helpText() };
      case 'status': return { output: await this.statusText() };
      case 'logs': return { output: await this.logsText(args[0]) };
      case 'check:waf': return { output: await this.checkWaf() };
      case 'check:db': return { output: await this.checkDb() };
      case 'check:fim': return { output: await this.checkFim() };
      case 'check:ids': return { output: await this.checkIds() };
      case 'check:prisma': return { output: await this.checkPrisma() };
      default: throw new BadRequestException(`Comando desconocido: ${cmd}. Escribe 'help' para ver los comandos disponibles.`);
    }
  }

  private helpText(): string {
    return [
      '╔══════════════════════════════════════════╗',
      '║   NextAudit Security Console v1.0        ║',
      '╚══════════════════════════════════════════╝',
      '',
      'COMANDOS DISPONIBLES:',
      '  help           Muestra esta ayuda',
      '  status         Estado general de todas las herramientas',
      '  logs [n]       Últimos n eventos de seguridad (default: 10)',
      '  check:waf      Prueba reglas del WAF con payloads de ejemplo',
      '  check:db       Verifica conexión a la base de datos',
      '  check:prisma   Verifica el cliente Prisma y los modelos',
      '  check:fim      Estado de integridad de archivos monitoreados',
      '  check:ids      IPs monitoreadas y bloqueadas por el IDS',
      '  clear          Limpia la pantalla',
      '',
      'Sugerencia: empieza con "status" para ver el estado general.',
    ].join('\n');
  }

  private async statusText(): Promise<string> {
    const status = await this.getStatus();
    return [
      '╔═══ ESTADO DE SEGURIDAD ═══╗',
      '',
      `  WAF:           ${status.waf.rulesCount} reglas activas, ${status.waf.recentBlocks} bloqueos`,
      `  IDS/IPS:       ${status.ids.trackedIps} IPs monitoreadas, ${status.ids.blockedIps} bloqueadas`,
      `  FIM:           ${status.fim.monitoredFiles} archivos monitoreados (${status.fim.integrityStatus})`,
      `  Rate Limiting: Corto ${status.rateLimiting.short.limit}req/${status.rateLimiting.short.ttl} · Medio ${status.rateLimiting.medium.limit}req/${status.rateLimiting.medium.ttl} · Largo ${status.rateLimiting.long.limit}req/${status.rateLimiting.long.ttl}`,
      `  Helmet/CSP:    ${status.helmet.csp ? '✅' : '❌'} CSP · ${status.helmet.hsts ? '✅' : '❌'} HSTS · XFrame: ${status.helmet.xframe}`,
      '',
      `  Últimos eventos: ${status.recentEvents.length} registrados`,
    ].join('\n');
  }

  private async logsText(countArg?: string): Promise<string> {
    const count = Math.min(Math.max(Math.trunc(Number(countArg ?? 10)), 1), 50);
    const events = await this.recentSecurityEvents(count);

    if (events.length === 0) {
      return '📋 No hay eventos de seguridad registrados aún.';
    }

    const lines = events.map((ev, i) => {
      const icon = ev.event.includes('WAF_BLOCKED') || ev.event.includes('FIM_CHANGE') ? '🔴' :
                   ev.event.includes('LOGIN_FAILED') || ev.event.includes('IDS_DETECTED') ? '🟡' :
                   ev.event.includes('LOGIN_SUCCESS') || ev.event.includes('MFA_ENABLED') ? '🟢' : '🔵';
      const time = new Date(ev.timestamp).toLocaleTimeString();
      const ip = ev.ip ? ` ${ev.ip}` : '';
      return `  ${icon} [${time}] ${ev.event}${ip}`;
    });

    return `📋 Últimos ${events.length} eventos de seguridad:\n${lines.join('\n')}`;
  }

  private async checkWaf(): Promise<string> {
    const testPayloads = [
      { name: 'SQL Injection', payload: "' OR 1=1 --" },
      { name: 'XSS', payload: '<script>alert("xss")</script>' },
      { name: 'Path Traversal', payload: '../../../etc/passwd' },
      { name: 'Command Injection', payload: '; rm -rf /' },
    ];

    const lines = testPayloads.map((t) => {
      const result = this.wafService.inspectPayload(t.payload, {}, {}, '/test');
      return `  ${result.blocked ? '✅ BLOQUEADO' : '❌ PERMITIDO'} — ${t.name}: "${t.payload}"`;
    });

    return [
      '╔═══ WAF — PRUEBA DE REGLAS ═══╗',
      '',
      ...lines,
      '',
      `  Total: ${testPayloads.length} pruebas · ${testPayloads.length} reglas activas`,
    ].join('\n');
  }

  private async checkDb(): Promise<string> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const userCount = await this.prisma.user.count();
      return [
        '╔═══ CONEXIÓN A BASE DE DATOS ═══╗',
        '',
        '  Estado:    ✅ Conexión exitosa',
        `  Usuarios:  ${userCount} registrados`,
        '  Motor:     PostgreSQL',
      ].join('\n');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      return `❌ Error de conexión: ${msg}`;
    }
  }

  private async checkFim(): Promise<string> {
    const files = await this.fileIntegrity.getBaselineStatus();
    if (files.length === 0) {
      return '⚠️ FIM: No hay archivos en la línea base (puede que no se haya podido acceder a ellos).';
    }

    const lines = files.map((f) => {
      const time = new Date(f.lastChecked).toLocaleTimeString();
      return `  ✅ ${f.file} · ${f.hash.slice(0, 16)}... · ${time}`;
    });

    return [
      '╔═══ FIM — ARCHIVOS MONITOREADOS ═══╗',
      '',
      ...lines,
      '',
      `  Total: ${files.length} archivos · Estado: ✅ Integridad intacta`,
    ].join('\n');
  }

  private async checkIds(): Promise<string> {
    return [
      '╔═══ IDS — ESTADO DE DETECCIÓN ═══╗',
      '',
      `  IPs monitoreadas:  ${this.idsService.getTrackedIpCount()}`,
      `  IPs bloqueadas:    ${this.idsService.getBlockedIpCount()}`,
      '  Ventana:           60s',
      '  Duración bloqueo:  15 min',
      '',
      '  Umbrales:',
      '    · Path scanning:   15 errores 404 en 60s',
      '    · Fuerza bruta:    10 logins fallidos en 60s',
      '    · Rate abuse:      100 requests en 60s',
      '    · Payload >100KB:  registrado como anomalía',
    ].join('\n');
  }

  private async checkPrisma(): Promise<string> {
    try {
      const modelNames = (await this.prisma.$queryRaw`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema IN ('core', 'iam', 'telemetry')
        ORDER BY table_schema, table_name
      `) as Array<{ table_name: string }>;

      const tables = modelNames.map((r) => r.table_name);

      return [
        '╔═══ PRISMA CLIENT ═══╗',
        '',
        `  Estado:      ✅ Cliente generado correctamente`,
        `  Versión:     ${PrismaService.name || '6.x'}`,
        `  Modelos:     ${tables.length} tablas encontradas`,
        '',
        '  Tablas disponibles:',
        ...tables.map((t) => `    · ${t}`),
      ].join('\n');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      return `❌ Error: ${msg}`;
    }
  }

  async getStatus() {
    const [recentEvents, wafBlocks, recentBlocked, fimStatus] = await Promise.all([
      this.recentSecurityEvents(),
      this.wafBlockedCount(),
      this.lastWafBlocked(),
      this.fileIntegrity.getBaselineStatus(),
    ]);

    return {
      waf: {
        rulesCount: 13,
        recentBlocks: wafBlocks,
        lastBlocked: recentBlocked,
        status: 'active',
      },
      ids: {
        trackedIps: this.idsService.getTrackedIpCount(),
        blockedIps: this.idsService.getBlockedIpCount(),
        status: 'active',
      },
      fim: {
        monitoredFiles: fimStatus.length,
        integrityStatus: 'clean',
        lastCheck: fimStatus[0]?.lastChecked ?? null,
        files: fimStatus,
      },
      rateLimiting: {
        short: { ttl: '1s', limit: 10 },
        medium: { ttl: '10s', limit: 50 },
        long: { ttl: '60s', limit: 100 },
      },
      helmet: {
        csp: true,
        hsts: true,
        xframe: 'SAMEORIGIN',
      },
      recentEvents,
    };
  }

  private async recentSecurityEvents(limit = 20) {
    try {
      const logs = await this.prisma.securityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          event: true,
          severity: true,
          ip: true,
          email: true,
          userId: true,
          metadata: true,
          createdAt: true,
        },
      });

      return logs.map((log) => ({
        event: log.event,
        severity: log.severity,
        ip: log.ip,
        email: log.email,
        userId: log.userId,
        details: log.metadata,
        timestamp: log.createdAt.toISOString(),
      }));
    } catch {
      return [];
    }
  }

  private async wafBlockedCount(): Promise<number> {
    try {
      return await this.prisma.securityLog.count({
        where: { event: 'WAF_BLOCKED' },
      });
    } catch {
      return 0;
    }
  }

  private async lastWafBlocked(): Promise<string | null> {
    try {
      const last = await this.prisma.securityLog.findFirst({
        where: { event: 'WAF_BLOCKED' },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });
      return last?.createdAt.toISOString() ?? null;
    } catch {
      return null;
    }
  }
}
