import type { BackoffStrategy } from 'bullmq';
import { UnavailabilityReason } from '../Types';
import { getNextLimitResetTimestampSeconds } from '../Helpers/GetNextLimitResetTimestamp';
import { redisClient } from '../../Redis/Provider';
import { getModelRPMKey } from '../Helpers/GetRedisKeys';
import { DateTime } from 'luxon';
import type { GeminiModels } from '../../AI/Types';

export const customBackoffStrategy: BackoffStrategy = async (
  attempts,
  _type,
  _err,
  job,
) => {
  const defaultDelay = 100;
  // const reason = err?.cause as UnavailabilityReason | undefined;
  const reason = null as unknown as UnavailabilityReason;
  const model = job?.data._lastUsedModel as
    | GeminiModels['PRO']
    | GeminiModels['FLASH'];

  switch (reason) {
    case UnavailabilityReason.RPDExceeded: {
      const resetTimestamp = getNextLimitResetTimestampSeconds();
      const delay =
        DateTime.fromSeconds(resetTimestamp).toMillis() -
        DateTime.now().toMillis();
      return delay > 0 ? delay + 1000 * 60 * 5 : 60000;
    }
    case UnavailabilityReason.RPMExceeded: {
      const ttl = await redisClient.ttl(getModelRPMKey(model.name));
      return (ttl + 5) * 1000;
    }
    case UnavailabilityReason.APIUnavailable: {
      return model.unavailableTimeoutSeconds * 1000;
    }
    default: {
      return 2 ** (Math.max(1, attempts) - 1) * defaultDelay;
    }
  }
};
