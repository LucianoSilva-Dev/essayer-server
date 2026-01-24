import { ConfigService } from '@config/config.service';
import { LoggerService } from '@core/logger/logger.service';
import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

/**
 * Test controller for custom logger functionality
 * This endpoint is for development/testing purposes only
 */
@ApiTags('Test - Logger')
@Controller('http-test/logger')
export class LoggerTestController {
  constructor(
    @Inject(LoggerService)
    private readonly logger: LoggerService,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(LoggerTestController.name);
  }

  /**
   * Triggers all log levels to test the custom logger with email notifications
   */
  @AllowAnonymous()
  @Get('all')
  @ApiOperation({
    summary: 'Triggers all log levels to test the custom logger',
  })
  async testAllLogLevels() {
    const config = {
      emailEnabled: this.configService.get<boolean>('LOGGER_EMAIL_ENABLED') ?? false,
      emailLevel: this.configService.get<string>('LOGGER_EMAIL_LEVEL') ?? 'error',
      emailRecipients: this.configService.get<string>('LOGGER_EMAIL_RECIPIENTS') ?? '',
      batchIntervalMs: this.configService.get<number>('LOGGER_EMAIL_BATCH_INTERVAL_MS') ?? 300000,
    };

    // Test all log levels
    this.logger.verbose(`🔍 VERBOSE log test`, config);
    this.logger.debug(`🐛 DEBUG log test`, config);
    this.logger.log(`📝 LOG log test`, config);
    this.logger.warn(`⚠️ WARN log test`, config);
    this.logger.error(`❌ ERROR log test`, config);
    this.logger.fatal(`💀 FATAL log test`, config);

    const willTriggerEmail = config.emailEnabled && config.emailRecipients.length > 0;

    return {
      success: true,
      message: 'All log levels have been triggered',
      config,
      emailNotification: {
        willTrigger: willTriggerEmail,
        reason: !config.emailEnabled
          ? 'Email disabled (LOGGER_EMAIL_ENABLED=false)'
          : !config.emailRecipients
            ? 'No recipients configured (LOGGER_EMAIL_RECIPIENTS empty)'
            : `Logs with level >= ${config.emailLevel} will be sent after ${config.batchIntervalMs}ms`,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
