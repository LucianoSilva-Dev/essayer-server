import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '../../config/config.service';
import { IntegrationController } from './integration.controller';
import { IntegrationService } from './integration.service';

describe('IntegrationController', () => {
  let controller: IntegrationController;

  const mockIntegrationService = {
    syncUserImage: vi.fn(),
  };

  const mockConfigService = {
    get: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfigService.get.mockReturnValue('test-sync-secret');
    controller = new IntegrationController(
      mockIntegrationService as unknown as IntegrationService,
      mockConfigService as unknown as ConfigService,
    );
  });

  it('should throw NotFoundException when no integration mapping exists', async () => {
    mockIntegrationService.syncUserImage.mockResolvedValue(null);

    await expect(
      controller.syncImage(
        'ext-missing',
        { image: 'https://cdn/image.jpg' },
        'test-sync-secret',
        'anglo-platform',
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException when sync secret is invalid', async () => {
    await expect(
      controller.syncImage(
        'ext-1',
        { image: 'https://cdn/image.jpg' },
        'wrong-secret',
        'anglo-platform',
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(mockIntegrationService.syncUserImage).not.toHaveBeenCalled();
  });

  it('should return synced response when mapping exists', async () => {
    mockIntegrationService.syncUserImage.mockResolvedValue({ userId: 'user-1' });

    await expect(
      controller.syncImage(
        'ext-1',
        { image: 'https://cdn/image.jpg' },
        'test-sync-secret',
        'anglo-platform',
      ),
    ).resolves.toEqual({ synced: true, userId: 'user-1' });
  });
});
