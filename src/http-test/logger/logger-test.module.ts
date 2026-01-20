import { Module } from '@nestjs/common';
import { LoggerTestController } from './logger-test.controller';
import { LoggerModule } from '@core/logger/logger.module';

/**
 * Module for logger testing endpoints
 * Contains controllers for testing logger functionality during development
 */
@Module({
    imports: [LoggerModule],
    controllers: [LoggerTestController],
})
export class LoggerTestModule {}
