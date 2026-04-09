import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IntegrationRepository } from './integration.repository';
import { IntegrationService } from './integration.service';

describe('IntegrationService', () => {
  let service: IntegrationService;
  let repository: IntegrationRepository;

  const mockRepository = {
    findIntegrationUser: vi.fn(),
    findUserByEmail: vi.fn(),
    findUserById: vi.fn(),
    createUser: vi.fn(),
    createIntegrationUser: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntegrationService, { provide: IntegrationRepository, useValue: mockRepository }],
    }).compile();

    service = module.get<IntegrationService>(IntegrationService);
    repository = module.get<IntegrationRepository>(IntegrationRepository);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('resolveOrCreateUser', () => {
    it('should return existing mapped user without creating new records', async () => {
      mockRepository.findIntegrationUser.mockResolvedValue({
        userId: 'user-1',
        externalUserId: 'ext-1',
        externalRole: 'student',
        integrationName: 'anglo-platform',
      });

      const result = await service.resolveOrCreateUser('anglo-platform', 'ext-1');

      expect(result).toEqual({
        userId: 'user-1',
        externalUserId: 'ext-1',
        externalRole: 'student',
        integrationName: 'anglo-platform',
        isNewUser: false,
      });
      expect(repository.findIntegrationUser).toHaveBeenCalledWith('anglo-platform', 'ext-1');
      expect(repository.createUser).not.toHaveBeenCalled();
      expect(repository.createIntegrationUser).not.toHaveBeenCalled();
    });

    it('should create mapping for existing user found by email', async () => {
      mockRepository.findIntegrationUser.mockResolvedValue(null);
      mockRepository.findUserByEmail.mockResolvedValue({
        id: 'user-2',
        email: 'john@anglo.local',
        name: 'John',
      });
      mockRepository.createIntegrationUser.mockResolvedValue({
        userId: 'user-2',
        externalUserId: 'ext-2',
        externalRole: 'teacher',
        integrationName: 'anglo-platform',
      });

      const result = await service.resolveOrCreateUser(
        'anglo-platform',
        'ext-2',
        'teacher',
        'John',
        'john@anglo.local',
      );

      expect(result).toEqual({
        userId: 'user-2',
        externalUserId: 'ext-2',
        externalRole: 'teacher',
        integrationName: 'anglo-platform',
        isNewUser: true,
      });
      expect(repository.findUserByEmail).toHaveBeenCalledWith('john@anglo.local');
      expect(repository.createUser).not.toHaveBeenCalled();
      expect(repository.createIntegrationUser).toHaveBeenCalledWith({
        integrationName: 'anglo-platform',
        userId: 'user-2',
        externalUserId: 'ext-2',
        externalRole: 'teacher',
      });
    });

    it('should create new user and mapping when no existing user found', async () => {
      mockRepository.findIntegrationUser.mockResolvedValue(null);
      mockRepository.findUserByEmail.mockResolvedValue(null);
      mockRepository.createUser.mockResolvedValue({
        id: 'user-3',
        email: 'new@anglo.local',
        name: 'New User',
      });
      mockRepository.createIntegrationUser.mockResolvedValue({
        userId: 'user-3',
        externalUserId: 'ext-3',
        externalRole: 'student',
        integrationName: 'anglo-platform',
      });

      const result = await service.resolveOrCreateUser(
        'anglo-platform',
        'ext-3',
        'student',
        'New User',
        'new@anglo.local',
      );

      expect(result).toEqual({
        userId: 'user-3',
        externalUserId: 'ext-3',
        externalRole: 'student',
        integrationName: 'anglo-platform',
        isNewUser: true,
      });
      expect(repository.createUser).toHaveBeenCalledWith({
        email: 'new@anglo.local',
        name: 'New User',
        emailVerified: true,
      });
      expect(repository.createIntegrationUser).toHaveBeenCalledWith({
        integrationName: 'anglo-platform',
        userId: 'user-3',
        externalUserId: 'ext-3',
        externalRole: 'student',
      });
    });

    it('should throw error when auto-provisioning without userName', async () => {
      mockRepository.findIntegrationUser.mockResolvedValue(null);
      mockRepository.findUserByEmail.mockResolvedValue(null);

      await expect(
        service.resolveOrCreateUser(
          'anglo-platform',
          'ext-4',
          'student',
          undefined,
          'email@test.com',
        ),
      ).rejects.toThrow('Cannot auto-provision user');
      expect(repository.createUser).not.toHaveBeenCalled();
    });

    it('should throw error when auto-provisioning without userEmail', async () => {
      mockRepository.findIntegrationUser.mockResolvedValue(null);
      mockRepository.findUserByEmail.mockResolvedValue(null);

      await expect(
        service.resolveOrCreateUser('anglo-platform', 'ext-4', 'student', 'Name', undefined),
      ).rejects.toThrow('Cannot auto-provision user');
      expect(repository.createUser).not.toHaveBeenCalled();
    });

    it('should default externalRole to student when not provided', async () => {
      mockRepository.findIntegrationUser.mockResolvedValue(null);
      mockRepository.findUserByEmail.mockResolvedValue(null);
      mockRepository.createUser.mockResolvedValue({
        id: 'user-5',
        email: 'test@test.com',
        name: 'Test',
      });
      mockRepository.createIntegrationUser.mockResolvedValue({
        userId: 'user-5',
        externalUserId: 'ext-5',
        externalRole: 'student',
        integrationName: 'default',
      });

      await service.resolveOrCreateUser('default', 'ext-5', undefined, 'Test', 'test@test.com');

      expect(repository.createIntegrationUser).toHaveBeenCalledWith(
        expect.objectContaining({ externalRole: 'student' }),
      );
    });
  });
});
