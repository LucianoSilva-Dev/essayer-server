import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { NotificationListener } from './notification.listener';
import { SseConnectionsManager } from './sse-connections.manager';

@Module({
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    NotificationListener,
    SseConnectionsManager,
  ],
})
export class NotificationModule {}
