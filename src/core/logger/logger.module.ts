import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { EmailModule } from 'src/core/email';

@Global()
@Module({
  imports: [EmailModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
