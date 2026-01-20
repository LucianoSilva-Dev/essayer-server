import { EmailModule } from '@core/email';
import { Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { EmailTestModule } from './http-test/email';
import { LoggerTestModule } from './http-test/logger';

@Module({
  imports: [ConfigModule, EmailModule, EmailTestModule, LoggerTestModule],
})
export class AppModule { }
