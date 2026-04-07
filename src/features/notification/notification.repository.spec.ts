import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationRepository } from './notification.repository';
import { PrismaService } from '@core/prisma/prisma.service';

describe('NotificationRepository', () => {
  let repository: NotificationRepository;
  let prisma: PrismaService;

  const mockPrismaNotification = {
    findMany: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  };

  const mockPrisma = {
    notification: mockPrismaNotification,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get<NotificationRepository>(NotificationRepository);
    prisma = module.get<PrismaService>(PrismaService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByRecipientUserId', () => {
    it('should query notifications with correct where clause', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'ACTIVITY_SENT',
          senders: [{ id: 'user-1' }],
          seenBy: [],
          activityNotification: { activityId: 'act-1', activity: { id: 'act-1' } },
          teacherRequestStatus: null,
        },
      ];
      mockPrismaNotification.findMany.mockResolvedValue(mockNotifications);

      const result = await repository.findByRecipientUserId('user-1');

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: {
          senders: { some: { id: 'user-1' } },
        },
        include: {
          seenBy: { select: { id: true } },
          activityNotification: { include: { activity: true } },
          teacherRequestStatus: { include: { teacherRequest: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockNotifications);
    });

    it('should return empty array when no notifications found', async () => {
      mockPrismaNotification.findMany.mockResolvedValue([]);

      const result = await repository.findByRecipientUserId('user-999');

      expect(result).toEqual([]);
    });
  });

  describe('markAsRead', () => {
    it('should update each notification with user in seenBy', async () => {
      mockPrismaNotification.update.mockResolvedValue({ id: 'notif-1' });

      await repository.markAsRead('user-1', ['notif-1', 'notif-2']);

      expect(prisma.notification.update).toHaveBeenCalledTimes(2);
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: { seenBy: { connect: { id: 'user-1' } } },
      });
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-2' },
        data: { seenBy: { connect: { id: 'user-1' } } },
      });
    });

    it('should handle single notification', async () => {
      mockPrismaNotification.update.mockResolvedValue({ id: 'notif-1' });

      await repository.markAsRead('user-1', ['notif-1']);

      expect(prisma.notification.update).toHaveBeenCalledTimes(1);
    });

    it('should handle empty array', async () => {
      await repository.markAsRead('user-1', []);

      expect(prisma.notification.update).not.toHaveBeenCalled();
    });
  });

  describe('createActivityNotification', () => {
    it('should create notification with activity relation', async () => {
      const mockCreated = { id: 'notif-new', type: 'ACTIVITY_SENT', createdAt: new Date() };
      mockPrismaNotification.create.mockResolvedValue(mockCreated);

      const result = await repository.createActivityNotification(
        'ACTIVITY_SENT',
        'activity-1',
        ['user-1', 'user-2'],
      );

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          type: 'ACTIVITY_SENT',
          senders: { connect: [{ id: 'user-1' }, { id: 'user-2' }] },
          activityNotification: { create: { activityId: 'activity-1' } },
        },
      });
      expect(result).toEqual(mockCreated);
    });
  });

  describe('createTeacherRequestNotification', () => {
    it('should create notification with teacher request relation and reason', async () => {
      const mockCreated = { id: 'notif-new', type: 'TEACHER_REQUEST_STATUS' };
      mockPrismaNotification.create.mockResolvedValue(mockCreated);

      const result = await repository.createTeacherRequestNotification(
        'req-1',
        ['user-1'],
        'Documents incomplete',
      );

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          type: 'TEACHER_REQUEST_STATUS',
          senders: { connect: [{ id: 'user-1' }] },
          teacherRequestStatus: {
            create: { teacherRequestId: 'req-1', motivo: 'Documents incomplete' },
          },
        },
      });
      expect(result).toEqual(mockCreated);
    });

    it('should create notification without reason', async () => {
      const mockCreated = { id: 'notif-new', type: 'TEACHER_REQUEST_STATUS' };
      mockPrismaNotification.create.mockResolvedValue(mockCreated);

      const result = await repository.createTeacherRequestNotification(
        'req-1',
        ['user-1'],
        undefined,
      );

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          type: 'TEACHER_REQUEST_STATUS',
          senders: { connect: [{ id: 'user-1' }] },
          teacherRequestStatus: {
            create: { teacherRequestId: 'req-1', motivo: undefined },
          },
        },
      });
    });
  });
});
