import { ConfigService } from '@config/config.service';
import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ESSAY_CORRECTION_QUEUE } from './bullmq.constants';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          db: configService.get('REDIS_DB'),
          username: configService.get('REDIS_USERNAME') || undefined,
          password: configService.get('REDIS_PASSWORD') || undefined,
        },
        defaultJobOptions: {
          removeOnComplete: true,
          attempts: 10,
        },
      }),
    }),
    BullModule.registerQueue({
      name: ESSAY_CORRECTION_QUEUE,
    }),
  ],
  exports: [BullModule],
})
export class BullMqModule {}
