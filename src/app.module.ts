import { Module } from '@nestjs/common';
import { ConfigModule } from './config';

@Module({
  imports: [ConfigModule],
})
export class AppModule {}
