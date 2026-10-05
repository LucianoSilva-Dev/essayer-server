import { Module } from '@nestjs/common';
import { AccessLogInterceptor } from './access-log.interceptor';
import { AccessLogCleanupTask } from './access-log-cleanup.task';
import { PrismaModule } from '@core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AccessLogInterceptor, AccessLogCleanupTask],
  exports: [AccessLogInterceptor, AccessLogCleanupTask],
})
export class AccessLogModule {}
