import { redisClient } from '../Redis/Provider';
import type { AppJobMap } from '../BullMQ/Types';
import { Worker } from 'bullmq';
import {
  getCurrentModelNameKey,
  getModelReqCountKey,
} from './Helpers/GetRedisKeys';
import { geminiModelsData } from '../AI/Constants';
import { googleGenAI } from '../AI/Provider';
import { generateAIContentConfig } from './Helpers/GenAIContentConfig';
import { ApiError } from '@google/genai';
import { correcaoRedacaoResponse } from './Validations';
import { AppEventEmitter } from '../Events/Emitter';

const correcaoRedacaoWorker = new Worker<AppJobMap['redacao:corrigir']>(
  'Redacao',
  async (job) => {
    let { _model: model, tema, texto, usuario, redacaoLivreId } = job.data;
    if (!model) {
      const currentModelName = await redisClient.get(getCurrentModelNameKey());
      model =
        currentModelName === geminiModelsData.PRO.name
          ? geminiModelsData.PRO
          : geminiModelsData.FLASH;
    }

    try {
      // Verifica o limite do modelo atual
      const currentModelCount =
        Number(await redisClient.get(getModelReqCountKey(model.name))) || 0;

      if (currentModelCount >= model.RPD) {
        // Se o limite do PRO for atingido, tenta o FLASH
        if (model.name === geminiModelsData.PRO.name) {
          console.log('Limite do modelo PRO atingido, alternando para FLASH.');
          model = geminiModelsData.FLASH;
          // Verifica o limite do FLASH
          const flashModelCount =
            Number(await redisClient.get(getModelReqCountKey(model.name))) || 0;
          if (flashModelCount >= model.RPD) {
            AppEventEmitter.emit('redacao:ia:delay', {
              redacaoLivreId,
              remetente: usuario,
            });
            throw new Error('Limite de ambos os modelos atingido.');
          }
        } else {
          // Se o limite do FLASH for atingido, emite evento e falha o job
          AppEventEmitter.emit('redacao:ia:delay', {
            redacaoLivreId,
            remetente: usuario,
          });
          throw new Error('Limite do modelo FLASH atingido.');
        }
      }

      await redisClient.incr(getModelReqCountKey(model.name));

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
      if (e instanceof ApiError && e.status === 429) {
        console.log(
          `Limite de requisições atingido para o modelo: ${model.name}`,
        );

        // Se o erro 429 for com o PRO, tenta com o FLASH
        if (model.name === geminiModelsData.PRO.name) {
          console.log('Alternando para o modelo FLASH...');
          const fallbackModel = geminiModelsData.FLASH;
          await redisClient.set(getCurrentModelNameKey(), fallbackModel.name);

          try {
            const fallbackResponse = await googleGenAI.models.generateContent(
              generateAIContentConfig(fallbackModel, tema, texto),
            );
            const correcaoOBJ = JSON.parse(fallbackResponse.text ?? '');
            const correcao = correcaoRedacaoResponse.parse(correcaoOBJ);

            AppEventEmitter.emit('redacao:ia:corrigida', {
              correcao,
              redacaoLivreId,
              remetente: usuario,
            });
          } catch (fallbackError) {
            console.error(
              'Erro na tentativa com o modelo FLASH:',
              fallbackError,
            );
            AppEventEmitter.emit('redacao:ia:delay', {
              redacaoLivreId,
              remetente: usuario,
            });
            throw fallbackError;
          }
        } else {
          // Se o erro 429 for com o FLASH, emite o evento de atraso
          AppEventEmitter.emit('redacao:ia:delay', {
            redacaoLivreId,
            remetente: usuario,
          });
          throw e; // Lança o erro para o BullMQ tratar
        }
      }

      console.error(`Erro genérico Capturado no Worker de Correção: ${e}`);
      throw e;
    }
  },
  { connection: redisClient },
);

correcaoRedacaoWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} falhou com o erro:`, err);
});