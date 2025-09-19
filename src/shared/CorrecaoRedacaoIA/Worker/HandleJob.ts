import type { Job } from 'bullmq';
import { ApiError } from '@google/genai';
import { geminiModelsData } from '../../AI/Constants';
import type { AppJobMap } from '../../BullMQ/Types';
import { AppEventEmitter } from '../../Events/Emitter';
import { checkModelAvailability } from './CheckModelAvailability';
import { processCorrecao } from './ProcessCorrecao';
import type { GeminiModels } from '../../AI/Types';

async function attemptCorrection(model: GeminiModels['PRO'] | GeminiModels['FLASH'], job: Job<AppJobMap['redacao:corrigir']>) {
    const isAvailable = await checkModelAvailability(model);
    if (!isAvailable) {
        return { success: false, reason: 'unavailable' };
    }

    try {
        await processCorrecao(model, job.data);
        return { success: true };
    } catch (error) {
        if (error instanceof ApiError && (error.status === 429 || error.status === 503)) {
            return { success: false, reason: 'api_error', error };
        }
        throw new Error('Erro Inesperado durante correção da redação');
    }
}


export async function handleJob(job: Job<AppJobMap['redacao:corrigir']>) {
    const { usuario, redacaoLivreId } = job.data;

    const primaryModel = geminiModelsData.FLASH;
    const fallbackModel = geminiModelsData.PRO;

    const primaryResult = await attemptCorrection(primaryModel, job);
    if (primaryResult.success) return

    console.log(`Falha com o modelo ${primaryModel.name}, tentando com o ${fallbackModel.name}...`);

    const fallbackResult = await attemptCorrection(fallbackModel, job);
    if (fallbackResult.success) return
    
    console.error(`Ambos os modelos (${primaryModel.name} e ${fallbackModel.name}) falharam. Job será atrasado.`);
    AppEventEmitter.emit('redacao:ia:delay', { redacaoLivreId, remetente: usuario });

    throw new Error(`Falha na correção da redação ${redacaoLivreId} após tentativas com ambos os modelos.`);
}