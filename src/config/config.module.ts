import { Global, Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService as NestConfigService,
} from '@nestjs/config';
import { ConfigService } from './config.service';
import envSchema from './env.schema';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [envSchema],
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: ConfigService,
      useExisting: NestConfigService,
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
