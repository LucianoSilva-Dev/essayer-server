import { Test, type TestingModule } from '@nestjs/testing';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationRepository } from './notification.repository';
import { NotificationService } from './notification.service';
import { SseConnectionsManager } from './sse-connections.manager';

describe('NotificationService', () => {
  let service: NotificationService;
  let repository: NotificationRepository;
  let sseManager: SseConnectionsManager;

  const mockRepository = {
    findByRecipientUserId: vi.fn(),
    markAsRead: vi.fn(),
  };

  const mockSseManager = {
    addConnection: vi.fn(),
    removeConnection: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: NotificationRepository, useValue: mockRepository },
        { provide: SseConnectionsManager, useValue: mockSseManager },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    repository = module.get<NotificationRepository>(NotificationRepository);
    sseManager = module.get<SseConnectionsManager>(SseConnectionsManager);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return empty array when user has no notifications', async () => {
      mockRepository.findByRecipientUserId.mockResolvedValue([]);

      const result = await service.getAll('user-1');

      expect(result).toEqual([]);
      expect(repository.findByRecipientUserId).toHaveBeenCalledWith('user-1');
    });

    it('should map activity notifications correctly', async () => {
      mockRepository.findByRecipientUserId.mockResolvedValue([
        {
          id: 'notif-1',
          type: 'ACTIVITY_SENT',
          createdAt: new Date(),
          updatedAt: new Date(),
          seenBy: [{ id: 'user-1' }],
          activityNotification: { activityId: 'activity-1', activity: { id: 'activity-1' } },
          teacherRequestStatus: null,
        },
      ]);

      const result = await service.getAll('user-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'notif-1',
        type: 'ACTIVITY_SENT',
        read: true,
        activityId: 'activity-1',
      });
    });

    it('should mark notification as unread when not in seenBy', async () => {
      mockRepository.findByRecipientUserId.mockResolvedValue([
        {
          id: 'notif-2',
          type: 'ACTIVITY_CORRECTED',
          createdAt: new Date(),
          updatedAt: new Date(),
          seenBy: [],
          activityNotification: { activityId: 'activity-2', activity: { id: 'activity-2' } },
          teacherRequestStatus: null,
        },
      ]);

      const result = await service.getAll('user-1');

      expect(result[0].read).toBe(false);
    });

    it('should map teacher request status notifications correctly', async () => {
      mockRepository.findByRecipientUserId.mockResolvedValue([
        {
          id: 'notif-3',
          type: 'TEACHER_REQUEST_STATUS',
          createdAt: new Date(),
          updatedAt: new Date(),
          seenBy: [],
          activityNotification: null,
          teacherRequestStatus: {
            teacherRequestId: 'req-1',
            motivo: 'Documents incomplete',
            teacherRequest: { id: 'req-1' },
          },
        },
      ]);

      const result = await service.getAll('user-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'notif-3',
        type: 'TEACHER_REQUEST_STATUS',
        read: false,
        teacherRequestId: 'req-1',
        reason: 'Documents incomplete',
      });
    });

    it('should handle mixed notification types', async () => {
      mockRepository.findByRecipientUserId.mockResolvedValue([
        {
          id: 'notif-1',
          type: 'ACTIVITY_SENT',
          createdAt: new Date(),
          updatedAt: new Date(),
          seenBy: [{ id: 'user-1' }],
          activityNotification: { activityId: 'act-1', activity: { id: 'act-1' } },
          teacherRequestStatus: null,
        },
        {
          id: 'notif-2',
          type: 'TEACHER_REQUEST_STATUS',
          createdAt: new Date(),
          updatedAt: new Date(),
          seenBy: [],
          activityNotification: null,
          teacherRequestStatus: {
            teacherRequestId: 'req-1',
            motivo: undefined,
            teacherRequest: { id: 'req-1' },
          },
        },
        {
          id: 'notif-3',
          type: 'ACTIVITY_CLOSED',
          createdAt: new Date(),
          updatedAt: new Date(),
          seenBy: [],
          activityNotification: { activityId: 'act-2', activity: { id: 'act-2' } },
          teacherRequestStatus: null,
        },
      ]);

      const result = await service.getAll('user-1');

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('ACTIVITY_SENT');
      expect(result[0].read).toBe(true);
      expect(result[1].type).toBe('TEACHER_REQUEST_STATUS');
      expect(result[1].read).toBe(false);
      expect(result[2].type).toBe('ACTIVITY_CLOSED');
      expect(result[2].read).toBe(false);
    });
  });

  describe('changeStatus', () => {
    it('should mark notifications as read', async () => {
      mockRepository.markAsRead.mockResolvedValue(undefined);

      const result = await service.changeStatus('user-1', {
        notificationIds: ['notif-1', 'notif-2'],
      });

      expect(repository.markAsRead).toHaveBeenCalledWith('user-1', [
        'notif-1',
        'notif-2',
      ]);
      expect(result).toBeNull();
    });

    it('should handle empty notification ids array', async () => {
      mockRepository.markAsRead.mockResolvedValue(undefined);

      const result = await service.changeStatus('user-1', {
        notificationIds: [],
      });

      expect(repository.markAsRead).toHaveBeenCalledWith('user-1', []);
      expect(result).toBeNull();
    });
  });

  describe('listen', () => {
    it('should return an observable that emits heartbeat events', async () => {
      const observable = service.listen('user-1');

      expect(sseManager.addConnection).toHaveBeenCalledWith(
        'user-1',
        expect.any(Subject),
      );

      await new Promise<void>((resolve, reject) => {
        const subscription = observable.subscribe({
          next: () => {
            subscription.unsubscribe();
            expect(sseManager.removeConnection).toHaveBeenCalledWith(
              'user-1',
              expect.any(Subject),
            );
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should register and unregister SSE connection on subscribe/unsubscribe', () => {
      const observable = service.listen('user-1');

      expect(sseManager.addConnection).toHaveBeenCalledTimes(1);

      const subscription = observable.subscribe();
      subscription.unsubscribe();

      expect(sseManager.removeConnection).toHaveBeenCalledWith(
        'user-1',
        expect.any(Subject),
      );
    });
  });
});
