import { EmailModule } from '@core/email';
import { PrismaModule } from '@core/prisma';
import { Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { EmailTestModule } from './http-test/email';
import { LoggerTestModule } from './http-test/logger';

@Module({
  imports: [ConfigModule, PrismaModule, EmailModule, EmailTestModule, LoggerTestModule],
})
export class AppModule {}
