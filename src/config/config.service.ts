import { ConfigService as NestConfigService } from '@nestjs/config';
import type { EnvConfig } from './env.schema';

export class ConfigService extends NestConfigService<EnvConfig> {}
