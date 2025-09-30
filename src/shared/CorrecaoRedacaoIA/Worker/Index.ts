import { Worker, QueueEvents } from 'bullmq';
import { redisClient } from '../../Redis/Provider';
import type { AppJobMap } from '../../BullMQ/Types';
import { handleJob } from './HandleJob';
import { customBackoffStrategy } from './BackoffStrategy';
import { RedacaoLivreModel } from '../../../features/RedacaoLivre/Model';
import { EnumCorrecaoRedacaoStatus } from '../Types';
import { CorrigirRedacaoQueue } from '../Queue';

export const correcaoRedacaoWorker = new Worker<AppJobMap['redacao:corrigir']>(
  'Redacao',
  handleJob,
  {
    connection: redisClient,
    autorun: false,
    settings: {
      backoffStrategy: customBackoffStrategy,
    },
  },
);

const queueEvents = new QueueEvents('Redacao', { connection: redisClient });

queueEvents.on('failed', async ({ jobId, failedReason }) => {
  const job = await CorrigirRedacaoQueue.getJob(jobId);
  if (!job) {
    return console.error(
      `Job com id ${jobId} não encontrado ao lidar com falha. Razão: ${failedReason}`,
    );
  }

  if (job.attemptsMade >= (job.opts.attempts ?? 0)) {
    const redacao = await RedacaoLivreModel.findById(job.data.redacaoLivreId);

    if (!redacao) {
      return console.error(
        `Redação de id '${job.data.redacaoLivreId}' atrelada ao Job '${job.id}' não encontrada.`,
      );
    }

    const correcao = redacao.correcoesIA.id(job.data.correcaoId);

    if (!correcao) {
      return console.error(
        `Correção de id '${job.data.correcaoId}' atrelada ao Job '${job.id}' não encontrada.`,
      );
    }

    correcao.set({
      status: EnumCorrecaoRedacaoStatus.Erro,
    });

    await redacao.save();
    console.error(
      `Job ${job.id} falhou definitivamente e foi marcado como erro. Razão: ${failedReason}`,
    );
  }
});

correcaoRedacaoWorker.on('error', (err) => {
  console.error(`Um erro ocorreu no worker de correção:`, err);
});