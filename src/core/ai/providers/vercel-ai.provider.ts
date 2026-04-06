import { google } from '@ai-sdk/google';
import type { ConfigService } from '@config/config.service';
import { REDIS_CLIENT } from '@core/redis/redis.constants';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { generateObject, generateText } from 'ai';
import type Redis from 'ioredis';
import type { z } from 'zod';
import {
  checkModelAvailability,
  incrementRateLimitCounters,
  markModelUnavailable,
} from '../helpers/rate-limit';
import type { IAiModelConfig, IAiProvider } from '../types';

@Injectable()
export class VercelAiProvider implements IAiProvider {
  private readonly logger = new Logger(VercelAiProvider.name);
  private readonly primary: IAiModelConfig;
  private readonly fallback: IAiModelConfig;

  constructor(
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {
    const unavailableTimeoutSecs =
      this.configService.get('AI_MODEL_UNAVAILABLE_TIMEOUT_SECS') ?? 60;

    this.primary = {
      name: this.configService.get('AI_PRIMARY_MODEL_NAME') ?? 'gemini-3-flash-preview',
      rpm: this.configService.get('AI_PRIMARY_MODEL_RPM') ?? 15,
      rpd: this.configService.get('AI_PRIMARY_MODEL_RPD') ?? 1500,
      unavailableTimeoutSecs,
      role: 'primary',
    };

    this.fallback = {
      name: this.configService.get('AI_FALLBACK_MODEL_NAME') ?? 'gemini-2.5-pro',
      rpm: this.configService.get('AI_FALLBACK_MODEL_RPM') ?? 5,
      rpd: this.configService.get('AI_FALLBACK_MODEL_RPD') ?? 500,
      unavailableTimeoutSecs,
      role: 'fallback',
    };
  }

  getModels(): { primary: IAiModelConfig; fallback: IAiModelConfig } {
    return { primary: this.primary, fallback: this.fallback };
  }

  async generate(prompt: string, system?: string): Promise<string> {
    return this.executeWithFallback((modelName) =>
      generateText({ model: google(modelName), prompt, system }),
    ).then((result) => result.text);
  }

  async generateObject<T>(prompt: string, schema: z.ZodSchema<T>, system?: string): Promise<T> {
    return this.executeWithFallback((modelName) =>
      generateObject({ model: google(modelName), schema, prompt, system }),
    ).then((result) => result.object);
  }

  private async executeWithFallback<T>(fn: (modelName: string) => Promise<T>): Promise<T> {
    const primaryAvailability = await checkModelAvailability(this.redis, this.primary);

    if (primaryAvailability.available) {
      try {
        await incrementRateLimitCounters(this.redis, this.primary);
        return await fn(this.primary.name);
      } catch (error: any) {
        if (this.is503(error)) {
          await markModelUnavailable(this.redis, this.primary);
        }
        if (this.isRetryable(error)) {
          this.logger.warn(
            `Primary model "${this.primary.name}" failed (${this.errorSummary(error)}), trying fallback "${this.fallback.name}"`,
          );
          return this.tryFallback(fn);
        }
        throw error;
      }
    }

    this.logger.warn(
      `Primary model "${this.primary.name}" unavailable (${primaryAvailability.reason}), using fallback "${this.fallback.name}"`,
    );
    return this.tryFallback(fn);
  }

  private async tryFallback<T>(fn: (modelName: string) => Promise<T>): Promise<T> {
    const fallbackAvailability = await checkModelAvailability(this.redis, this.fallback);

    if (!fallbackAvailability.available) {
      throw new Error(`All AI models unavailable. Fallback: ${fallbackAvailability.reason}`);
    }

    await incrementRateLimitCounters(this.redis, this.fallback);

    try {
      return await fn(this.fallback.name);
    } catch (error: any) {
      if (this.is503(error)) {
        await markModelUnavailable(this.redis, this.fallback);
      }
      throw error;
    }
  }

  private is503(error: any): boolean {
    return error?.status === 503 || error?.statusCode === 503;
  }

  private isRetryable(error: any): boolean {
    const status = error?.status ?? error?.statusCode;
    return status === 429 || status === 503;
  }

  private errorSummary(error: any): string {
    const status = error?.status ?? error?.statusCode;
    return `status=${status} ${error?.message ?? 'unknown'}`;
  }
}
