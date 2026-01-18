import { EmailModule } from '@core/email';
import { Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { EmailTestModule } from './http-test/email';

@Module({
  imports: [ConfigModule, EmailModule, EmailTestModule],
})
export class AppModule {}
