import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { watch, type FSWatcher } from 'node:fs';
import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { SecurityEvent, SecurityLoggerService } from '../logger/security-logger.service';

interface FileBaseline {
  path: string;
  hash: string;
  lastChecked: number;
}

@Injectable()
export class FileIntegrityService implements OnModuleInit, OnModuleDestroy {
  private readonly monitoredFiles: string[];
  private readonly baseline = new Map<string, FileBaseline>();
  private readonly watchers: FSWatcher[] = [];
  private readonly pollInterval: ReturnType<typeof setInterval>;
  private readonly POLL_MS = 15 * 60_000;
  private readonly projectRoot: string;

  constructor(private readonly securityLogger: SecurityLoggerService) {
    this.projectRoot = join(__dirname, '..', '..', '..', '..', '..', '..');
    this.monitoredFiles = [
      '.env',
      'prisma/schema.prisma',
      'apps/api/src/app.module.ts',
      'package.json',
      'eslint.config.mjs',
      'apps/api/src/common/waf/waf-rules.ts',
      'apps/api/src/common/ids/ids-signatures.ts',
    ];
    this.pollInterval = setInterval(() => this.checkIntegrity(), this.POLL_MS);
  }

  async onModuleInit(): Promise<void> {
    await this.buildBaseline();
    this.startWatching();
    this.securityLogger.log('FileIntegrityService iniciado - monitoreando archivos criticos');
  }

  onModuleDestroy(): void {
    clearInterval(this.pollInterval);
    for (const w of this.watchers) w.close();
  }

  private async buildBaseline(): Promise<void> {
    for (const relativePath of this.monitoredFiles) {
      const fullPath = join(this.projectRoot, relativePath);
      try {
        await access(fullPath);
        const content = await readFile(fullPath, 'utf-8');
        const hash = this.hashContent(content);
        this.baseline.set(relativePath, { path: fullPath, hash, lastChecked: Date.now() });
      } catch {
        this.securityLogger.warn(`FIM: No se pudo acceder al archivo ${relativePath} para baseline`);
      }
    }
  }

  private startWatching(): void {
    for (const [relativePath, baseline] of this.baseline.entries()) {
      try {
        const watcher = watch(baseline.path, (eventType) => {
          if (eventType === 'change') {
            this.onFileChanged(relativePath);
          }
        });
        this.watchers.push(watcher);
      } catch {
        this.securityLogger.warn(`FIM: No se pudo iniciar watch en ${relativePath}`);
      }
    }
  }

  private async onFileChanged(relativePath: string): Promise<void> {
    const baseline = this.baseline.get(relativePath);
    if (!baseline) return;

    const previousHash = baseline.hash;

    try {
      const content = await readFile(baseline.path, 'utf-8');
      const newHash = this.hashContent(content);

      if (newHash !== previousHash) {
        baseline.hash = newHash;
        baseline.lastChecked = Date.now();

        this.securityLogger.recordSecurityEvent(SecurityEvent.FIM_CHANGE, {
          details: {
            file: relativePath,
            previousHash,
            newHash,
            event: 'change',
          },
        });
      }
    } catch {
      this.securityLogger.recordSecurityEvent(SecurityEvent.FIM_CHANGE, {
        details: {
          file: relativePath,
          event: 'deleted',
          message: 'Archivo monitoreado eliminado o inaccesible',
        },
      });
    }
  }

  private async checkIntegrity(): Promise<void> {
    for (const [relativePath, baseline] of this.baseline.entries()) {
      try {
        const content = await readFile(baseline.path, 'utf-8');
        const currentHash = this.hashContent(content);

        if (currentHash !== baseline.hash) {
          const previousHash = baseline.hash;
          baseline.hash = currentHash;
          baseline.lastChecked = Date.now();

          this.securityLogger.recordSecurityEvent(SecurityEvent.FIM_CHANGE, {
            details: {
              file: relativePath,
              previousHash,
              newHash: currentHash,
              event: 'integrity_check_change',
            },
          });
        }
      } catch {
        this.securityLogger.recordSecurityEvent(SecurityEvent.FIM_CHANGE, {
          details: {
            file: relativePath,
            event: 'integrity_check_unreachable',
          },
        });
      }
    }
  }

  getBaselineStatus(): Array<{ file: string; hash: string; lastChecked: string }> {
    const result: Array<{ file: string; hash: string; lastChecked: string }> = [];
    for (const [relativePath, baseline] of this.baseline.entries()) {
      result.push({
        file: relativePath,
        hash: baseline.hash,
        lastChecked: new Date(baseline.lastChecked).toISOString(),
      });
    }
    return result;
  }

  private hashContent(content: string): string {
    return createHash('sha256').update(content, 'utf-8').digest('hex');
  }
}
