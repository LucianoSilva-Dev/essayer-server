import { redisClient } from '../Redis/Provider';
import type { AppJobMap } from '../BullMQ/Types';
import { Worker } from 'bullmq';
import {
  getCurrentModelNameKey,
  getModelReqCountKey,
} from './Helpers/GetRedisKeys';
import { geminiModelsData } from '../AI/Constants';

const correcaoRedacaoWorker = new Worker<AppJobMap['redacao:corrigir']>(
  'Redacao',
  async (job) => {
    let { _model: model } = job.data;
    if (!model) {
      const currentModelName = await redisClient.get(getCurrentModelNameKey());
      switch (currentModelName) {
        case geminiModelsData.FLASH.name:
          model = geminiModelsData.FLASH;
          break;
        case geminiModelsData.PRO.name:
          model = geminiModelsData.PRO;
          break;
      }
    }
    // Implementar logica para corrigir redação e fazer retry dos jobs
    return { success: true, message: 'Correção concluída.' };
  },
  { connection: redisClient },
);

correcaoRedacaoWorker.on('completed', (job, result) => {
  console.log(`Job ${job.id} concluído com resultado:`, result);
});

correcaoRedacaoWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} falhou com o erro:`, err);
});
