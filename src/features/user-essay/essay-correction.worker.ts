import { AI_PROVIDER } from '@core/ai/ai.constants';
import { ESSAY_CORRECTION_QUEUE } from '@core/bullmq/bullmq.constants';
import { REDIS_CLIENT } from '@core/redis/redis.constants';
import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { Job, Worker } from 'bullmq';
import { Worker as BullWorker } from 'bullmq';
import Redis from 'ioredis';
import type { IAiProvider } from '@core/ai/types';
import type { IEssayCorrectionJobData } from '@core/bullmq/types';
import {
  CorrectionCompletedPayload,
  CorrectionDelayedPayload,
  CorrectionPersistedPayload,
} from '@core/events/payloads/correction.payloads';
import { essayCorrectionResultSchema } from './types/correction.types';
import {
  essayCorrectionSystemPrompt,
  formatEssayCorrectionPrompt,
} from './prompts/correction.prompts';

@Injectable()
export class EssayCorrectionWorker implements OnModuleDestroy {
  private readonly logger = new Logger(EssayCorrectionWorker.name);
  private worker: Worker<IEssayCorrectionJobData> | null = null;

  constructor(
    @Inject(AI_PROVIDER) private readonly aiProvider: IAiProvider,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    const connection = this.redis.duplicate();

    this.worker = new BullWorker(
      ESSAY_CORRECTION_QUEUE,
      async (job: Job<IEssayCorrectionJobData>) => this.processJob(job),
      {
        connection: connection as any,
        settings: {
          backoffStrategy: (attemptsMade: number) => {
            return Math.min(2 ** attemptsMade * 2000, 120_000);
          },
        },
      },
    );

    this.worker!.on('failed', async (job: Job<IEssayCorrectionJobData> | undefined, err: Error) => {
      if (!job) return;

      const isPermanentFailure = job.attemptsMade >= (job.opts.attempts ?? 10);
      if (isPermanentFailure) {
        this.logger.error(
          `Permanent failure for correction ${job.data.correctionId}: ${err.message}`,
        );
        this.eventEmitter.emit(
          'correction.ai.persisted',
          new CorrectionPersistedPayload(
            job.data.essayId,
            job.data.correctionId,
            job.data.userId,
          ),
        );
      }
    });
  }

  onModuleDestroy() {
    return this.worker?.close();
  }

  private async processJob(job: Job<IEssayCorrectionJobData>) {
    const { essayId, correctionId, theme, text, userId } = job.data;

    try {
      const prompt = formatEssayCorrectionPrompt(theme, text);
      const result = await this.aiProvider.generateObject(
        prompt,
        essayCorrectionResultSchema,
        essayCorrectionSystemPrompt,
      );

      this.eventEmitter.emit(
        'correction.ai.completed',
        new CorrectionCompletedPayload(essayId, correctionId, userId, result),
      );
    } catch (error: any) {
      const status = error?.status ?? error?.statusCode;
      if (status === 429) {
        this.eventEmitter.emit(
          'correction.ai.delayed',
          new CorrectionDelayedPayload(essayId, userId),
        );
      }
      throw error;
    }
  }
}

