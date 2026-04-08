import { AiModule } from '@core/ai';
import { BullMqModule } from '@core/bullmq';
import { EmailModule } from '@core/email';
import { EventsModule } from '@core/events';
import { IntegrationModule } from '@core/integration';
import { PrismaModule } from '@core/prisma';
import { RedisModule } from '@core/redis';
import { StorageCleanupModule } from '@core/storage-cleanup/storage-cleanup.module';
import { StorageModule } from '@core/storage/storage.module';
import { ActivityModule } from '@features/activity/activity.module';
import { ArticleModule } from '@features/article/article.module';
import { CitationModule } from '@features/citation/citation.module';
import { ClassModule } from '@features/class/class.module';
import { NotificationModule } from '@features/notification/notification.module';
import { RepertoireModule } from '@features/repertoire/repertoire.module';
import { TeacherRequestModule } from '@features/teacher-request/teacher-request.module';
import { UserEssayModule } from '@features/user-essay/user-essay.module';
import { UserModule } from '@features/user/user.module';
import { WorkModule } from '@features/work/work.module';
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
    RedisModule,
    EventsModule,
    BullMqModule,
    AiModule,
    EmailModule,
    AuthModule,
    IntegrationModule,
    EmailTestModule,
    LoggerTestModule,

    ActivityModule,
    ClassModule,
    NotificationModule,
    RepertoireModule,
    TeacherRequestModule,
    UserEssayModule,
    UserModule,
    WorkModule,
    CitationModule,
    ArticleModule,

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
