import { Worker } from 'bullmq';
import { redisClient } from '../../Redis/Provider';
import type { AppJobMap } from '../../BullMQ/Types';
import { handleJob } from './handleJob';

export const correcaoRedacaoWorker = new Worker<AppJobMap['redacao:corrigir']>(
  'Redacao',
  handleJob,
  { connection: redisClient, autorun: false },
);

correcaoRedacaoWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} falhou com o erro:`, err);
});