import { ConfigService } from '@config/config.service';
import { EMAIL_PROVIDER } from '@core/email';
import type { IEmailProvider } from '@core/email/types';
import { ConsoleLogger, Inject, Injectable, type OnModuleDestroy } from '@nestjs/common';

type LogLevel = 'fatal' | 'error' | 'warn' | 'log' | 'debug' | 'verbose';

interface ILogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  timestamp: Date;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  fatal: 0,
  error: 1,
  warn: 2,
  log: 3,
  debug: 4,
  verbose: 5,
};

@Injectable()
export class LoggerService extends ConsoleLogger implements OnModuleDestroy {
  private readonly isEnabled: boolean;
  private readonly minLevel: LogLevel;
  private readonly recipients: string[];
  private readonly batchIntervalMs: number;
  private readonly timezone: string;

  private logBuffer: ILogEntry[] = [];
  private batchTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    @Inject(EMAIL_PROVIDER)
    private readonly emailService: IEmailProvider,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {
    super();
    this.isEnabled = this.configService.get<boolean>('LOGGER_EMAIL_ENABLED') ?? false;
    this.minLevel = this.configService.get<LogLevel>('LOGGER_EMAIL_LEVEL') ?? 'error';
    this.recipients = this.parseRecipients(
      this.configService.get<string>('LOGGER_EMAIL_RECIPIENTS') ?? '',
    );
    this.batchIntervalMs =
      this.configService.get<number>('LOGGER_EMAIL_BATCH_INTERVAL_MS') ?? 300000;
    this.timezone = this.configService.get<string>('TZ') ?? 'America/Sao_Paulo';
  }

  onModuleDestroy() {
    // Flush any remaining logs before shutdown
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    if (this.logBuffer.length > 0) {
      void this.flushLogs();
    }
  }

  override error(message: unknown, ...optionalParams: unknown[]) {
    super.error(message, ...optionalParams);
    this.handleLog('error', message, optionalParams);
  }

  override fatal(message: unknown, ...optionalParams: unknown[]) {
    super.fatal(message, ...optionalParams);
    this.handleLog('fatal', message, optionalParams);
  }

  override warn(message: unknown, ...optionalParams: unknown[]) {
    super.warn(message, ...optionalParams);
    this.handleLog('warn', message, optionalParams);
  }

  override log(message: unknown, ...optionalParams: unknown[]) {
    super.log(message, ...optionalParams);
    this.handleLog('log', message, optionalParams);
  }

  override debug(message: unknown, ...optionalParams: unknown[]) {
    super.debug(message, ...optionalParams);
    this.handleLog('debug', message, optionalParams);
  }

  override verbose(message: unknown, ...optionalParams: unknown[]) {
    super.verbose(message, ...optionalParams);
    this.handleLog('verbose', message, optionalParams);
  }

  private parseRecipients(recipients: string): string[] {
    return recipients
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);
  }

  private shouldNotify(level: LogLevel): boolean {
    if (!this.isEnabled) return false;
    if (this.recipients.length === 0) return false;
    return LOG_LEVEL_PRIORITY[level] <= LOG_LEVEL_PRIORITY[this.minLevel];
  }

  private handleLog(level: LogLevel, message: unknown, optionalParams: unknown[]) {
    if (!this.shouldNotify(level)) return;

    const context = this.extractContext(optionalParams);
    const entry: ILogEntry = {
      level,
      message: this.messageToString(message),
      context,
      timestamp: new Date(),
    };

    this.logBuffer.push(entry);
    this.scheduleBatch();
  }

  private extractContext(optionalParams: unknown[]): string | undefined {
    // NestJS logger often passes context as last string param
    for (const param of optionalParams) {
      if (typeof param === 'string') {
        return param;
      }
    }
    return undefined;
  }

  private messageToString(message: unknown): string {
    if (typeof message === 'string') return message;
    if (message instanceof Error) return message.message;
    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }

  private scheduleBatch() {
    if (this.batchTimeout) return; // Already scheduled

    this.batchTimeout = setTimeout(() => {
      this.batchTimeout = null;
      void this.flushLogs();
    }, this.batchIntervalMs);
  }

  private async flushLogs() {
    if (this.logBuffer.length === 0) return;

    const logs = [...this.logBuffer];
    this.logBuffer = [];

    // Calculate counts per level
    const levelCounts = logs.reduce(
      (acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Build subject with breakdown
    const subjectParts: string[] = [];
    if (levelCounts.fatal) subjectParts.push(`${levelCounts.fatal} fatal`);
    if (levelCounts.error) subjectParts.push(`${levelCounts.error} error`);
    if (levelCounts.warn) subjectParts.push(`${levelCounts.warn} warn`);
    if (levelCounts.log) subjectParts.push(`${levelCounts.log} log`);
    if (levelCounts.debug) subjectParts.push(`${levelCounts.debug} debug`);
    if (levelCounts.verbose) subjectParts.push(`${levelCounts.verbose} verbose`);

    const subject = `[Incita Backend] ${logs.length} log(s): ${subjectParts.join(', ')}`;

    try {
      await this.emailService.sendMail({
        to: this.recipients,
        subject,
        template: 'error-notification',
        context: {
          logs,
          levelCounts: {
            fatal: levelCounts.fatal || 0,
            error: levelCounts.error || 0,
            warn: levelCounts.warn || 0,
            log: levelCounts.log || 0,
            debug: levelCounts.debug || 0,
            verbose: levelCounts.verbose || 0,
          },
          appName: 'Incita Backend',
          generatedAt: new Date().toLocaleString('pt-BR', {
            timeZone: this.timezone,
          }),
        },
      });
    } catch (err) {
      // Use parent's error to avoid infinite loop
      super.error('Failed to send error notification email', err);
    }
  }
}
