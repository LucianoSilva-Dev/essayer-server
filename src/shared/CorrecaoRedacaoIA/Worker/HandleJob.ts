import type { Job } from 'bullmq';
import { ApiError } from '@google/genai';
import type { AppJobMap } from '../../BullMQ/Types';
import { AppEventEmitter } from '../../Events/Emitter';
import { checkModelAvailability } from './CheckModelAvailability';
import { processCorrecao } from './ProcessCorrecao';
import type { GeminiModels } from '../../AI/Types';
import { UnavailabilityReason } from '../Types';
import { GetModelPriority } from '../Helpers/GetModelPriority';

async function attemptCorrection(
  model: GeminiModels['PRO'] | GeminiModels['FLASH'],
  job: Job<AppJobMap['redacao:corrigir']>,
) {
  const isAvailable = await checkModelAvailability(model);
  if (!isAvailable.success) {
    return { success: false, reason: isAvailable.reason } as const;
  }

  try {
    await processCorrecao(model, job.data);
    return { success: true } as const;
  } catch (error) {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 429:
          return {
            success: false,
            reason: UnavailabilityReason.Generic429HttpError,
            error,
          } as const;

        case 503:
          return {
            success: false,
            reason: UnavailabilityReason.APIUnavailable,
            error,
          } as const;

        default:
          return {
            success: false,
            reason: UnavailabilityReason.GenericError,
            error,
          } as const;
      }
    }
    throw new Error('Erro Inesperado durante correção da redação');
  }
}

export async function handleJob(job: Job<AppJobMap['redacao:corrigir']>) {
  const { usuario, redacaoLivreId } = job.data;

  const [primaryModel, fallbackModel] = await GetModelPriority();

  await job.updateData({
    ...job.data,
    _lastUsedModel: primaryModel,
  });
  const primaryResult = await attemptCorrection(primaryModel, job);
  if (primaryResult.success) return;

  console.log(
    `Falha com o modelo ${primaryModel.name}, tentando com o ${fallbackModel.name}...`,
  );

  await job.updateData({
    ...job.data,
    _lastUsedModel: primaryModel,
  });

  const fallbackResult = await attemptCorrection(fallbackModel, job);
  if (fallbackResult.success) return;

  console.error(
    `Ambos os modelos (${primaryModel.name} e ${fallbackModel.name}) falharam. Job será atrasado.`,
  );
  AppEventEmitter.emit('redacao:ia:delay', {
    redacaoLivreId,
    remetente: usuario,
  });
  throw new Error(
    `Falha na correção da redação ${redacaoLivreId} após tentativas com ambos os modelos.`,
    { cause: fallbackResult.reason },
  );
}
