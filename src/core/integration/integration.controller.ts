import {
  Body,
  Controller,
  ForbiddenException,
  Headers,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ConfigService } from '../../config/config.service';
import { IntegrationService } from './integration.service';

export class SyncUserImageDto {
  image!: string | null;
}

@Controller('integration')
export class IntegrationController {
  private readonly logger = new Logger(IntegrationController.name);

  constructor(
    private readonly integrationService: IntegrationService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * PATCH /integration/users/:externalUserId/image
   * Protected by x-sync-secret header (server-to-server only).
   * Called by Anglo after avatar upload or delete.
   * Query param integrationName (default: 'anglo-platform').
   */
  @AllowAnonymous()
  @Patch('users/:externalUserId/image')
  async syncImage(
    @Param('externalUserId') externalUserId: string,
    @Body() body: SyncUserImageDto,
    @Headers('x-sync-secret') syncSecret: string | undefined,
    @Query('integrationName') integrationName: string = 'anglo-platform',
  ) {
    const expected = this.configService.get('ANGLO_SYNC_SECRET');

    if (!expected || !syncSecret || syncSecret !== expected) {
      throw new ForbiddenException('Invalid sync secret');
    }

    // Normalize: empty string → null (avatar deleted)
    const image = body.image === '' ? null : (body.image ?? null);

    const result = await this.integrationService.syncUserImage(
      integrationName,
      externalUserId,
      image,
    );

    if (!result) {
      this.logger.warn(
        `syncImage: no mapping found for integrationName=${integrationName} externalUserId=${externalUserId}`,
      );
      throw new NotFoundException('Integration user mapping not found');
    }

    this.logger.log(
      `syncImage: updated user ${result.userId} image (externalUserId=${externalUserId})`,
    );
    return { synced: true, userId: result.userId };
  }
}
