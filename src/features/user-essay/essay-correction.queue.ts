import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import type { Queue, Job } from 'bullmq';
import { ESSAY_CORRECTION_QUEUE } from '@core/bullmq/bullmq.constants';
import type { IEssayCorrectionJobData } from '@core/bullmq/types';

@Injectable()
export class EssayCorrectionQueue {
  constructor(
    @InjectQueue(ESSAY_CORRECTION_QUEUE) private readonly queue: Queue<IEssayCorrectionJobData>,
  ) {}

  async addCorrectionJob(data: IEssayCorrectionJobData) {
    return this.queue.add('correctEssay', data, {
      jobId: data.correctionId,
    });
  }

  async getJob(correctionId: string): Promise<Job<IEssayCorrectionJobData> | undefined> {
    return this.queue.getJob(correctionId);
  }

  async removeJob(correctionId: string) {
    const job = await this.getJob(correctionId);
    if (job) {
      await job.remove();
    }
  }
}
