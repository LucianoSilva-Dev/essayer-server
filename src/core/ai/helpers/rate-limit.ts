import type Redis from 'ioredis';
import type { IAiModelConfig } from '../types';
import { getModelRpdKey, getModelRpmKey, getModelUnavailableKey } from './redis-keys';

export async function checkModelAvailability(
  redis: Redis,
  model: IAiModelConfig,
): Promise<{ available: boolean; reason?: string }> {
  const dailyCountKey = getModelRpdKey(model.name);
  const minuteCountKey = getModelRpmKey(model.name);
  const unavailableKey = getModelUnavailableKey(model.name);

  const [dailyCount, minuteCount, isUnavailable] = await redis.mget([
    dailyCountKey,
    minuteCountKey,
    unavailableKey,
  ]);

  if (isUnavailable === 'true') {
    return { available: false, reason: 'API Unavailable' };
  }

  if (Number(dailyCount) >= model.rpd) {
    return { available: false, reason: 'RPD Exceeded' };
  }

  if (Number(minuteCount) >= model.rpm) {
    return { available: false, reason: 'RPM Exceeded' };
  }

  return { available: true };
}

export async function incrementRateLimitCounters(
  redis: Redis,
  model: IAiModelConfig,
): Promise<void> {
  const dailyCountKey = getModelRpdKey(model.name);
  const minuteCountKey = getModelRpmKey(model.name);

  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setUTCHours(24, 0, 0, 0);
  const nextResetSeconds = Math.floor(nextMidnight.getTime() / 1000);

  const multi = redis.multi();
  multi.incr(dailyCountKey);
  multi.incr(minuteCountKey);
  multi.expire(minuteCountKey, 60, 'NX');
  multi.expireat(dailyCountKey, nextResetSeconds, 'NX');
  await multi.exec();
}

export async function markModelUnavailable(redis: Redis, model: IAiModelConfig): Promise<void> {
  await redis.set(getModelUnavailableKey(model.name), 'true', 'EX', model.unavailableTimeoutSecs);
}
