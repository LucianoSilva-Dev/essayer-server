import IORedis from 'ioredis'
import { REDIS_HOST, REDIS_PORT } from '../Env'

export const redisClient = new IORedis({host: REDIS_HOST, port: REDIS_PORT})