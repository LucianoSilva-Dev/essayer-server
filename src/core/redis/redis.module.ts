import { ConfigService } from '@config/config.service';
import {
  Global,
  Inject,
  Logger,
  Module,
  type OnModuleDestroy,
  type Provider,
} from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

/**
 * Redis provider factory
 * Creates a Redis client instance with configuration from environment variables.
 *
 * Configuration options:
 * - REDIS_HOST: Redis server hostname (required)
 * - REDIS_PORT: Redis server port (default: 6379)
 * - REDIS_USERNAME: Optional username for authentication
 * - REDIS_PASSWORD: Optional password for authentication
 */
const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): Redis => {
    const logger = new Logger('RedisModule');

    const host = configService.get('REDIS_HOST');
    const port = configService.get('REDIS_PORT');
    const username = configService.get('REDIS_USERNAME');
    const password = configService.get('REDIS_PASSWORD');

    const redis = new Redis({
      host,
      port,
      username: username || undefined,
      password: password || undefined,
      maxRetriesPerRequest: null, // Required for BullMQ compatibility
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    redis.on('error', (err) => {
      logger.error('Redis connection error:', err);
    });

    redis.on('connect', () => {
      logger.log(`Connected to Redis at ${host}:${port}`);
    });

    return redis;
  },
};

/**
 * Global Redis Module
 * Provides a Redis client instance via dependency injection using the REDIS_CLIENT token.
 *
 * This module is marked as @Global() so the REDIS_CLIENT is available throughout
 * the application without explicit imports.
 *
 * @example
 * // Inject the Redis client
 * constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}
 *
 * // Basic operations
 * await this.redis.set('key', 'value');
 * const value = await this.redis.get('key');
 */
@Global()
@Module({
  providers: [redisProvider],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnModuleDestroy {
  private readonly logger = new Logger(RedisModule.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onModuleDestroy() {
    this.logger.log('Closing Redis connection...');
    await this.redis.quit();
    this.logger.log('Redis connection closed');
  }
}
