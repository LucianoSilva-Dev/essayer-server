import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigService } from 'src/config/config.service';
import { EMAIL_PROVIDER, type IEmailProvider } from 'src/core/email';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;
  let emailService: IEmailProvider;

  const mockEmailService = {
    sendMail: vi.fn(),
  };

  const createMockConfigService = (overrides: Record<string, unknown> = {}) => {
    const defaults: Record<string, unknown> = {
      LOGGER_EMAIL_ENABLED: false,
      LOGGER_EMAIL_LEVEL: 'error',
      LOGGER_EMAIL_RECIPIENTS: '',
      LOGGER_EMAIL_BATCH_INTERVAL_MS: 100, // Short interval for tests
    };
    const config = { ...defaults, ...overrides };
    return {
      get: vi.fn((key: string) => config[key]),
    };
  };

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('when disabled', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LoggerService,
          { provide: EMAIL_PROVIDER, useValue: mockEmailService },
          {
            provide: ConfigService,
            useValue: createMockConfigService({ LOGGER_EMAIL_ENABLED: false }),
          },
        ],
      }).compile();

      service = module.get<LoggerService>(LoggerService);
      emailService = module.get<IEmailProvider>(EMAIL_PROVIDER);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should not send email when disabled', async () => {
      vi.useFakeTimers();

      service.error('Test error message');
      await vi.advanceTimersByTimeAsync(200);

      expect(emailService.sendMail).not.toHaveBeenCalled();
    });
  });

  describe('when enabled with recipients', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LoggerService,
          { provide: EMAIL_PROVIDER, useValue: mockEmailService },
          {
            provide: ConfigService,
            useValue: createMockConfigService({
              LOGGER_EMAIL_ENABLED: true,
              LOGGER_EMAIL_LEVEL: 'error',
              LOGGER_EMAIL_RECIPIENTS: 'admin@example.com, dev@example.com ',
              LOGGER_EMAIL_BATCH_INTERVAL_MS: 100,
            }),
          },
        ],
      }).compile();

      service = module.get<LoggerService>(LoggerService);
      emailService = module.get<IEmailProvider>(EMAIL_PROVIDER);
    });

    it('should send email for error logs after batch interval', async () => {
      vi.useFakeTimers();

      service.error('Test error message');
      await vi.advanceTimersByTimeAsync(200);

      expect(emailService.sendMail).toHaveBeenCalledTimes(1);
      expect(emailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['admin@example.com', 'dev@example.com'],
          template: 'error-notification',
        }),
      );
    });

    it('should batch multiple errors into single email', async () => {
      vi.useFakeTimers();

      service.error('Error 1');
      service.error('Error 2');
      service.fatal('Fatal error');
      await vi.advanceTimersByTimeAsync(200);

      expect(emailService.sendMail).toHaveBeenCalledTimes(1);
      const callArg = (emailService.sendMail as Mock).mock.calls[0][0] as {
        context: { logs: unknown[] };
      };
      expect(callArg.context.logs).toHaveLength(3);
    });

    it('should not send email for warn when level is error', async () => {
      vi.useFakeTimers();

      service.warn('Test warning');
      await vi.advanceTimersByTimeAsync(200);

      expect(emailService.sendMail).not.toHaveBeenCalled();
    });

    it('should send email for fatal logs', async () => {
      vi.useFakeTimers();

      service.fatal('Critical failure');
      await vi.advanceTimersByTimeAsync(200);

      expect(emailService.sendMail).toHaveBeenCalledTimes(1);
    });
  });

  describe('when level is warn', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LoggerService,
          { provide: EMAIL_PROVIDER, useValue: mockEmailService },
          {
            provide: ConfigService,
            useValue: createMockConfigService({
              LOGGER_EMAIL_ENABLED: true,
              LOGGER_EMAIL_LEVEL: 'warn',
              LOGGER_EMAIL_RECIPIENTS: 'admin@example.com',
              LOGGER_EMAIL_BATCH_INTERVAL_MS: 100,
            }),
          },
        ],
      }).compile();

      service = module.get<LoggerService>(LoggerService);
      emailService = module.get<IEmailProvider>(EMAIL_PROVIDER);
    });

    it('should send email for warn logs when level is warn', async () => {
      vi.useFakeTimers();

      service.warn('Test warning');
      await vi.advanceTimersByTimeAsync(200);

      expect(emailService.sendMail).toHaveBeenCalledTimes(1);
    });
  });

  describe('when no recipients configured', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LoggerService,
          { provide: EMAIL_PROVIDER, useValue: mockEmailService },
          {
            provide: ConfigService,
            useValue: createMockConfigService({
              LOGGER_EMAIL_ENABLED: true,
              LOGGER_EMAIL_RECIPIENTS: '',
            }),
          },
        ],
      }).compile();

      service = module.get<LoggerService>(LoggerService);
      emailService = module.get<IEmailProvider>(EMAIL_PROVIDER);
    });

    it('should not send email when no recipients', async () => {
      vi.useFakeTimers();

      service.error('Test error');
      await vi.advanceTimersByTimeAsync(200);

      expect(emailService.sendMail).not.toHaveBeenCalled();
    });
  });

  describe('graceful failure handling', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LoggerService,
          { provide: EMAIL_PROVIDER, useValue: mockEmailService },
          {
            provide: ConfigService,
            useValue: createMockConfigService({
              LOGGER_EMAIL_ENABLED: true,
              LOGGER_EMAIL_RECIPIENTS: 'admin@example.com',
              LOGGER_EMAIL_BATCH_INTERVAL_MS: 100,
            }),
          },
        ],
      }).compile();

      service = module.get<LoggerService>(LoggerService);
      emailService = module.get<IEmailProvider>(EMAIL_PROVIDER);
    });

    it('should not throw when email sending fails', async () => {
      vi.useFakeTimers();
      (emailService.sendMail as Mock).mockRejectedValue(new Error('SMTP error'));

      service.error('Test error');

      await expect(vi.advanceTimersByTimeAsync(200)).resolves.not.toThrow();
    });
  });
});
