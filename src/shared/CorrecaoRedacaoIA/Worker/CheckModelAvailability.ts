import { redisClient } from '../../Redis/Provider';
import { getModelRPDKey, getModelRPMKey, getModelUnavailableKey } from '../Helpers/GetRedisKeys';
import type { GeminiModels } from '../../AI/Types';

export async function checkModelAvailability(model: GeminiModels['PRO'] | GeminiModels['FLASH']): Promise<boolean> {
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
    return false;
  }

  if (Number(dailyCount) >= model.RPD) {
    console.warn(`Limite diário atingido para o modelo: ${model.name}`);
    return false;
  }

  if (Number(minuteCount) >= model.RPM) {
    console.warn(`Limite por minuto atingido para o modelo: ${model.name}`);
    return false;
  }
  
  return true;
}

export async function incrementRateLimitCounters(model: GeminiModels['PRO'] | GeminiModels['FLASH']): Promise<void> {
    const dailyCountKey = getModelRPDKey(model.name);
    const minuteCountKey = getModelRPMKey(model.name);

    const multi = redisClient.multi();
    multi.incr(dailyCountKey);
    multi.incr(minuteCountKey);
    // Define o TTL apenas se a chave não tiver um
    multi.expire(minuteCountKey, 60, 'NX');

    await multi.exec();
}