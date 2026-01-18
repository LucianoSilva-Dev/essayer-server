import { Module } from '@nestjs/common';
import { EmailTestController } from './email-test.controller';

/**
 * Module for email testing endpoints
 * Contains controllers for testing email functionality during development
 */
@Module({
  controllers: [EmailTestController],
})
export class EmailTestModule {}
