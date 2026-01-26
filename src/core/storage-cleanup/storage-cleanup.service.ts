import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ConfigService } from 'src/config/config.service';
import { STORAGE_PROVIDER } from 'src/core/storage/storage.constants';
import type { IStorageProvider } from 'src/core/storage/types';
import { StorageCleanupRepository } from './storage-cleanup.repository';

@Injectable()
export class StorageCleanupService implements OnModuleInit {
  private readonly logger = new Logger(StorageCleanupService.name);

  constructor(
    @Inject(StorageCleanupRepository)
    private readonly storageCleanupRepository: StorageCleanupRepository,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(SchedulerRegistry)
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
  ) {}

  onModuleInit() {
    const cronExpression = this.configService.get<string>('STORAGE_CLEANUP_CRON') || '0 3 * * *';

    const job = new CronJob(cronExpression, () => {
      void this.handleCleanup();
    });

    this.schedulerRegistry.addCronJob('storage-cleanup', job);
    job.start();

    this.logger.log(`Storage cleanup scheduled with cron expression: ${cronExpression}`);
  }

  /**
   * The cleanup job that finds and deletes orphaned files.
   */
  async handleCleanup(): Promise<void> {
    this.logger.log('Starting storage cleanup job...');

    try {
      // 1. Get all file IDs from storage
      const storageFiles = await this.storageProvider.list();
      this.logger.log(`Found ${storageFiles.length} files in storage`);

      if (storageFiles.length === 0) {
        this.logger.log('No files in storage. Cleanup complete.');
        return;
      }

      // 2. Get all referenced file IDs from database
      const referencedFileIds = await this.getReferencedFileIds();
      this.logger.log(`Found ${referencedFileIds.size} file references in database`);

      // 3. Find orphaned files
      const orphanedFiles = storageFiles.filter((fileId) => !referencedFileIds.has(fileId));
      this.logger.log(`Found ${orphanedFiles.length} orphaned files`);

      if (orphanedFiles.length === 0) {
        this.logger.log('No orphaned files found. Cleanup complete.');
        return;
      }

      // 4. Delete orphaned files
      let deletedCount = 0;
      let errorCount = 0;

      for (const fileId of orphanedFiles) {
        try {
          await this.storageProvider.delete(fileId);
          deletedCount++;
          this.logger.debug(`Deleted orphaned file: ${fileId}`);
        } catch (error) {
          errorCount++;
          this.logger.error(
            `Failed to delete orphaned file: ${fileId}`,
            error instanceof Error ? error.stack : error,
          );
        }
      }

      this.logger.log(`Storage cleanup complete. Deleted: ${deletedCount}, Errors: ${errorCount}`);
    } catch (error) {
      this.logger.error('Storage cleanup job failed', error instanceof Error ? error.stack : error);
    }
  }

  /**
   * Collects all file IDs referenced in the database.
   * Checks all tables that have file references.
   */
  private async getReferencedFileIds(): Promise<Set<string>> {
    const fileIds = new Set<string>();

    // User.imageFileId
    const userImageIds = await this.storageCleanupRepository.findAllUserImageFileIds();
    userImageIds.forEach((id) => {
      fileIds.add(id);
    });

    return fileIds;
  }

  /**
   * Manual trigger for cleanup - can be called from dev tools or admin endpoints.
   */
  async triggerCleanup(): Promise<{
    deleted: number;
    errors: number;
    orphaned: number;
  }> {
    this.logger.log('Manual cleanup trigger initiated');

    const storageFiles = await this.storageProvider.list();
    const referencedFileIds = await this.getReferencedFileIds();

    const orphanedFiles = storageFiles.filter((fileId) => !referencedFileIds.has(fileId));

    let deleted = 0;
    let errors = 0;

    for (const fileId of orphanedFiles) {
      try {
        await this.storageProvider.delete(fileId);
        deleted++;
      } catch {
        errors++;
      }
    }

    return { deleted, errors, orphaned: orphanedFiles.length };
  }
}
