import { Module } from '@nestjs/common';
import { WorkController } from './work.controller';
import { WorkService } from './work.service';
import { WorkRepository } from './work.repository';

@Module({
  controllers: [WorkController],
  providers: [WorkService, WorkRepository],
})
export class WorkModule {}
