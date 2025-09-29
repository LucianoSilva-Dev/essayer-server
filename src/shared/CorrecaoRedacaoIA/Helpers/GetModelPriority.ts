import { geminiModelsData } from '../../AI/Constants';
import { redisClient } from '../../Redis/Provider';
import { getCurrentModelNameKey } from './GetRedisKeys';

export async function GetModelPriority() {
  const primaryModel =
    (await redisClient.get(getCurrentModelNameKey())) ===
    geminiModelsData.PRO.name
      ? geminiModelsData.PRO
      : geminiModelsData.FLASH;

  const fallbackModel =
    primaryModel.name === geminiModelsData.FLASH.name
      ? geminiModelsData.PRO
      : geminiModelsData.FLASH;

    return [primaryModel, fallbackModel] as const
}
