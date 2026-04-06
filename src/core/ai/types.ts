import type { z } from 'zod';

export type ModelRole = 'primary' | 'fallback';

export interface IAiModelConfig {
  name: string;
  rpm: number;
  rpd: number;
  unavailableTimeoutSecs: number;
  role: ModelRole;
}

export interface IAiProvider {
  generate(prompt: string, system?: string): Promise<string>;
  generateObject<T>(prompt: string, schema: z.ZodSchema<T>, system?: string): Promise<T>;
}
