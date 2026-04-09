import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { IntegrationRepository } from './integration.repository';

describe('IntegrationRepository', () => {
  let repository: IntegrationRepository;
  let prisma: PrismaService;

  const mockPrisma = {
    integrationUser: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntegrationRepository, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    repository = module.get<IntegrationRepository>(IntegrationRepository);
    prisma = module.get<PrismaService>(PrismaService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findIntegrationUser', () => {
    it('should find integration user by integrationName and externalUserId with included user', async () => {
      const expected = {
        id: 'iu-1',
        integrationName: 'anglo-platform',
        userId: 'user-1',
        externalUserId: 'ext-1',
        externalRole: 'student',
        user: { id: 'user-1', name: 'John' },
      };
      mockPrisma.integrationUser.findFirst.mockResolvedValue(expected);

      const result = await repository.findIntegrationUser('anglo-platform', 'ext-1');

      expect(result).toEqual(expected);
      expect(prisma.integrationUser.findFirst).toHaveBeenCalledWith({
        where: { integrationName: 'anglo-platform', externalUserId: 'ext-1' },
        include: { user: true },
      });
    });

    it('should return null when no mapping found', async () => {
      mockPrisma.integrationUser.findFirst.mockResolvedValue(null);

      const result = await repository.findIntegrationUser('unknown', 'ext-999');

      expect(result).toBeNull();
    });
  });

  describe('findUserById', () => {
    it('should find user by ID', async () => {
      const expected = { id: 'user-1', name: 'John', email: 'john@test.com' };
      mockPrisma.user.findUnique.mockResolvedValue(expected);

      const result = await repository.findUserById('user-1');

      expect(result).toEqual(expected);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      const expected = { id: 'user-1', email: 'john@test.com' };
      mockPrisma.user.findUnique.mockResolvedValue(expected);

      const result = await repository.findUserByEmail('john@test.com');

      expect(result).toEqual(expected);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'john@test.com' } });
    });
  });

  describe('createUser', () => {
    it('should create user with default emailVerified', async () => {
      const expected = {
        id: 'user-new',
        email: 'new@test.com',
        name: 'New',
        emailVerified: true,
        role: 'student',
      };
      mockPrisma.user.create.mockResolvedValue(expected);

      const result = await repository.createUser({ email: 'new@test.com', name: 'New' });

      expect(result).toEqual(expected);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { email: 'new@test.com', name: 'New', emailVerified: true, role: 'student' },
      });
    });

    it('should create user with explicit emailVerified false', async () => {
      mockPrisma.user.create.mockResolvedValue({});

      await repository.createUser({ email: 'test@test.com', name: 'Test', emailVerified: false });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { email: 'test@test.com', name: 'Test', emailVerified: false, role: 'student' },
      });
    });
  });

  describe('createIntegrationUser', () => {
    it('should create integration user mapping with included user', async () => {
      const data = {
        integrationName: 'anglo-platform',
        userId: 'user-1',
        externalUserId: 'ext-1',
        externalRole: 'student',
      };
      const expected = { ...data, id: 'iu-1', user: { id: 'user-1' } };
      mockPrisma.integrationUser.create.mockResolvedValue(expected);

      const result = await repository.createIntegrationUser(data);

      expect(result).toEqual(expected);
      expect(prisma.integrationUser.create).toHaveBeenCalledWith({
        data,
        include: { user: true },
      });
    });
  });
});
