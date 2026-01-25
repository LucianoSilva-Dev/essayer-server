import { EmailModule } from '@core/email';
import { PrismaModule } from '@core/prisma';
import { StorageModule } from '@core/storage/storage.module';
import { StorageCleanupModule } from '@core/storage-cleanup/storage-cleanup.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { AuthModule } from './core/auth/auth.module';
import { EmailTestModule } from './http-test/email';
import { LoggerTestModule } from './http-test/logger';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    EmailModule,
    AuthModule,
    EmailTestModule,
    LoggerTestModule,
    StorageModule,
    // StorageCleanupModule,
  ],
})
export class AppModule {}
