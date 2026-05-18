import { PrismaService } from '@core/prisma';
import { REDIS_CLIENT } from '@core/redis';
import { Inject, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async getStatus() {
    await Promise.all([this.prisma.$queryRaw`SELECT 1`, this.redis.ping()]);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        redis: 'up',
      },
    };
  }
}
