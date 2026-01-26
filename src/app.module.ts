import { EmailModule } from '@core/email';
import { PrismaModule } from '@core/prisma';
import { StorageModule } from '@core/storage/storage.module';
import { StorageCleanupModule } from '@core/storage-cleanup/storage-cleanup.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from './config';
import { AuthModule } from './core/auth/auth.module';
import type { StorageDriverOptions } from './core/storage/types';
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
    StorageModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        driver: configService.get<StorageDriverOptions>('STORAGE_DRIVER') ?? 'r2',
      }),
    }),
    StorageCleanupModule,
  ],
})
export class AppModule {}
