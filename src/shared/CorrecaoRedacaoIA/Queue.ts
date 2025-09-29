import { Queue } from 'bullmq';
import type { AppJobMap } from '../BullMQ/Types';
import { redisClient } from '../Redis/Provider';

export const CorrigirRedacaoQueue = new Queue<AppJobMap['redacao:corrigir']>(
  'Redacao',
  {
    connection: redisClient,
    defaultJobOptions: {
      removeOnComplete: true,
      attempts: 10,
      backoff: { type: 'custom' },
    },
  },
);
