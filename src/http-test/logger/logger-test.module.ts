import { LoggerModule } from '@core/logger/logger.module';
import { Module } from '@nestjs/common';
import { LoggerTestController } from './logger-test.controller';
/**
 * Module for logger testing endpoints
 * Contains controllers for testing logger functionality during development
 */
@Module({
  imports: [LoggerModule],
  controllers: [LoggerTestController],
})
export class LoggerTestModule {}
