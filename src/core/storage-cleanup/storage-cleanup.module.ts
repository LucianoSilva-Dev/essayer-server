import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { StorageCleanupRepository } from './storage-cleanup.repository';
import { StorageCleanupService } from './storage-cleanup.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [StorageCleanupService, StorageCleanupRepository],
  exports: [StorageCleanupService, StorageCleanupRepository],
})
export class StorageCleanupModule {}
