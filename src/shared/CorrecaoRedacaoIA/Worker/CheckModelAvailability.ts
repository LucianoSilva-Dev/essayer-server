import { redisClient } from '../../Redis/Provider';
import {
  getCurrentModelNameKey,
  getModelRPDKey,
  getModelRPMKey,
  getModelUnavailableKey,
} from '../Helpers/GetRedisKeys';
import type { GeminiModels } from '../../AI/Types';
import { getNextLimitResetTimestampSeconds } from '../Helpers/GetNextLimitResetTimestamp';
import { geminiModelsData } from '../../AI/Constants';
import { UnavailabilityReason } from '../Types';

async function toggleCurrentModel(
  model: GeminiModels['PRO'] | GeminiModels['FLASH'],
) {
  const modelToToggle =
    model.name === geminiModelsData.PRO.name
      ? geminiModelsData.FLASH.name
      : geminiModelsData.PRO.name;
  await redisClient.set(getCurrentModelNameKey(), modelToToggle);
}

export async function checkModelAvailability(
  model: GeminiModels['PRO'] | GeminiModels['FLASH'],
) {
  const dailyCountKey = getModelRPDKey(model.name);
  const minuteCountKey = getModelRPMKey(model.name);
  const unavailableKey = getModelUnavailableKey(model.name);

  const [dailyCount, minuteCount, isUnavailable] = await redisClient.mget([
    dailyCountKey,
    minuteCountKey,
    unavailableKey,
  ]);

  if (isUnavailable === 'true') {
    console.warn(`Modelo ${model.name} está temporariamente indisponível.`);
    await toggleCurrentModel(model);
    return {
      success: false,
      reason: UnavailabilityReason.APIUnavailable,
    } as const;
  }

  if (Number(dailyCount) >= model.RPD) {
    console.warn(`Limite diário atingido para o modelo: ${model.name}`);
    await toggleCurrentModel(model);
    return {
      success: false,
      reason: UnavailabilityReason.RPDExceeded,
    } as const;
  }

  if (Number(minuteCount) >= model.RPM) {
    console.warn(`Limite por minuto atingido para o modelo: ${model.name}`);
    await toggleCurrentModel(model);
    return {
      success: false,
      reason: UnavailabilityReason.RPMExceeded,
    } as const;
  }

  return { success: true } as const;
}

export async function incrementRateLimitCounters(
  model: GeminiModels['PRO'] | GeminiModels['FLASH'],
): Promise<void> {
  const dailyCountKey = getModelRPDKey(model.name);
  const minuteCountKey = getModelRPMKey(model.name);

  const multi = redisClient.multi();
  multi.incr(dailyCountKey);
  multi.incr(minuteCountKey);
  multi.expire(minuteCountKey, 60, 'NX');
  multi.expireat(dailyCountKey, getNextLimitResetTimestampSeconds(), 'NX');

  await multi.exec();
}
