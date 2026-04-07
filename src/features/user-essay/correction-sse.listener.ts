import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CorrectionSseConnectionsManager } from './correction-sse-connections.manager';
import { UserEssayRepository } from './user-essay.repository';
import type { CorrectionDelayedPayload, CorrectionPersistedPayload } from '@core/events/payloads/correction.payloads';

@Injectable()
export class CorrectionSseListener {
  private readonly logger = new Logger(CorrectionSseListener.name);

  constructor(
    private readonly sseManager: CorrectionSseConnectionsManager,
    private readonly repository: UserEssayRepository,
  ) {}

  @OnEvent('correction.ai.persisted', { async: true })
  async handleCorrectionPersisted(payload: CorrectionPersistedPayload) {
    try {
      const correction = await this.repository.findAiCorrectionById(
        payload.correctionId,
      );

      if (!correction) return;

      const statusStr = correction.status === 'FINISHED' ? 'FINISHED' : 'ERROR';

      this.sseManager.pushToEssay(payload.freeWritingId, {
        event: statusStr === 'FINISHED' ? 'ESSAY_CORRECTED' : 'ESSAY_CORRECTION_ERROR',
        data: JSON.stringify({
          correctionId: payload.correctionId,
          status: statusStr,
        }),
      });
    } catch (error: any) {
      this.logger.error(
        `Failed to handle correction persisted event: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent('correction.ai.delayed', { async: true })
  async handleCorrectionDelayed(payload: CorrectionDelayedPayload) {
    try {
      this.sseManager.pushToEssay(payload.freeWritingId, {
        event: 'CORRECTION_DELAYED',
        data: JSON.stringify({ message: 'Correction is taking longer than expected' }),
      });
    } catch (error: any) {
      this.logger.error(
        `Failed to handle correction delayed event: ${error.message}`,
        error.stack,
      );
    }
  }
}
