import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import envSchema from './env.schema';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [envSchema],
      isGlobal: true,
    }),
  ],
})
export class ConfigModule {}
