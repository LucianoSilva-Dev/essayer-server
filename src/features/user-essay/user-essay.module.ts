import { Module } from '@nestjs/common';
import { UserEssayController } from './user-essay.controller';
import { UserEssayService } from './user-essay.service';
import { UserEssayRepository } from './user-essay.repository';
import { EssayCorrectionQueue } from './essay-correction.queue';
import { EssayCorrectionWorker } from './essay-correction.worker';
import { CorrectionCompletedListener } from './correction-completed.listener';
import { CorrectionSseListener } from './correction-sse.listener';
import { CorrectionSseConnectionsManager } from './correction-sse-connections.manager';

@Module({
  controllers: [UserEssayController],
  providers: [
    UserEssayService,
    UserEssayRepository,
    EssayCorrectionQueue,
    EssayCorrectionWorker,
    CorrectionCompletedListener,
    CorrectionSseListener,
    CorrectionSseConnectionsManager,
  ],
})
export class UserEssayModule {}
