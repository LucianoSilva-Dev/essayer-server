import IORedis from 'ioredis';
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT, REDIS_USERNAME } from '../Env';

export const redisClient = new IORedis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  username: REDIS_USERNAME ?? undefined,
  password: REDIS_PASSWORD ?? undefined,
  family: 0, // permite host ipv4 e ipv6
  maxRetriesPerRequest: null,
});
