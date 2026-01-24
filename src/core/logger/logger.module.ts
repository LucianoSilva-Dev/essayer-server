import { Global, Module } from '@nestjs/common';
import { EmailModule } from 'src/core/email';
import { LoggerService } from './logger.service';

@Global()
@Module({
  imports: [EmailModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
