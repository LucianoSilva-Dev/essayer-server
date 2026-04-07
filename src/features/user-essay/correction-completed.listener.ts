import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnEvent } from '@nestjs/event-emitter';
import { UserEssayRepository } from './user-essay.repository';
import { CorrectionCompletedPayload, CorrectionPersistedPayload } from '@core/events/payloads/correction.payloads';

@Injectable()
export class CorrectionCompletedListener {
  private readonly logger = new Logger(CorrectionCompletedListener.name);

  constructor(
    private readonly repository: UserEssayRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('correction.ai.completed', { async: true })
  async handleCorrectionCompleted(payload: CorrectionCompletedPayload) {
    try {
      const correction = await this.repository.updateAiCorrectionToFinished(
        payload.correctionId,
        payload.correction as any,
      );

      this.logger.log(
        `Correction ${payload.correctionId} persisted successfully for essay ${payload.freeWritingId}`,
      );

      this.eventEmitter.emit(
        'correction.ai.persisted',
        new CorrectionPersistedPayload(
          payload.freeWritingId,
          payload.correctionId,
          payload.userId,
        ),
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to persist correction ${payload.correctionId}: ${error.message}`,
        error.stack,
      );
    }
  }
}
