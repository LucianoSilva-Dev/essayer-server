import { googleGenAI } from '../../AI/Provider';
import { generateAIContentConfig } from '../Helpers/GenAIContentConfig';
import { correcaoRedacaoResponse } from '../Validations';
import { AppEventEmitter } from '../../Events/Emitter';
import type { GeminiModels } from '../../AI/Types';
import type { AppJobMap } from '../../BullMQ/Types';
import { ApiError } from '@google/genai';
import { redisClient } from '../../Redis/Provider';
import { getModelUnavailableKey } from '../Helpers/GetRedisKeys';
import { incrementRateLimitCounters } from './CheckModelAvailability';


export async function processCorrecao(
    model: GeminiModels['PRO'] | GeminiModels['FLASH'],
    jobData: AppJobMap['redacao:corrigir'],
) {
    const { tema, texto, usuario, redacaoLivreId } = jobData;

    try {
        // Incrementa os contadores apenas antes da tentativa de requisição
        await incrementRateLimitCounters(model);

        const response = await googleGenAI.models.generateContent(
            generateAIContentConfig(model, tema, texto),
        );
        const correcaoOBJ = JSON.parse(response.text ?? '');
        const correcao = correcaoRedacaoResponse.parse(correcaoOBJ);

        AppEventEmitter.emit('redacao:ia:corrigida', {
            correcao,
            redacaoLivreId,
            remetente: usuario,
        });
    } catch (e) {
        if (e instanceof ApiError && e.status === 503) {
            console.error(`Serviço indisponível para o modelo: ${model.name}. Marcando como indisponível por ${model.unavailableTimeoutSeconds} segundos.`);
            await redisClient.set(getModelUnavailableKey(model.name), 'true', 'EX', model.unavailableTimeoutSeconds);
        }
        // Re-lança o erro para ser tratado pelo handleJob
        throw e;
    }
}