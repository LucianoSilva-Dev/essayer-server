import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActivitySubmittedPayload, ActivityClosedPayload, ActivityCorrectedPayload, TeacherRequestStatusPayload } from '@core/events';
import { NotificationListener } from './notification.listener';
import { NotificationRepository } from './notification.repository';
import { SseConnectionsManager } from './sse-connections.manager';

describe('NotificationListener', () => {
  let listener: NotificationListener;
  let repository: NotificationRepository;
  let sseManager: SseConnectionsManager;

  const mockNotification = { id: 'notif-1', type: 'ACTIVITY_SENT', createdAt: new Date() };

  const mockRepository = {
    createActivityNotification: vi.fn(),
    createTeacherRequestNotification: vi.fn(),
  };

  const mockSseManager = {
    pushToUsers: vi.fn(),
    pushToUser: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationListener,
        { provide: NotificationRepository, useValue: mockRepository },
        { provide: SseConnectionsManager, useValue: mockSseManager },
      ],
    }).compile();

    listener = module.get<NotificationListener>(NotificationListener);
    repository = module.get<NotificationRepository>(NotificationRepository);
    sseManager = module.get<SseConnectionsManager>(SseConnectionsManager);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(listener).toBeDefined();
  });

  describe('handleActivitySubmitted', () => {
    it('should create notification and push SSE event', async () => {
      mockRepository.createActivityNotification.mockResolvedValue(mockNotification);

      await listener.handleActivitySubmitted(
        new ActivitySubmittedPayload('activity-1', ['teacher-1']),
      );

      expect(repository.createActivityNotification).toHaveBeenCalledWith(
        'ACTIVITY_SENT',
        'activity-1',
        ['teacher-1'],
      );
      expect(sseManager.pushToUsers).toHaveBeenCalledWith(
        ['teacher-1'],
        expect.objectContaining({
          event: 'ACTIVITY_SENT',
          data: expect.any(String),
        }),
      );

      const sseData = JSON.parse((sseManager.pushToUsers as ReturnType<typeof vi.fn>).mock.calls[0][1].data);
      expect(sseData).toEqual({
        id: 'notif-1',
        type: 'ACTIVITY_SENT',
        read: false,
        activityId: 'activity-1',
      });
    });

    it('should handle repository errors gracefully', async () => {
      mockRepository.createActivityNotification.mockRejectedValue(new Error('DB error'));

      await expect(
        listener.handleActivitySubmitted(
          new ActivitySubmittedPayload('activity-1', ['teacher-1']),
        ),
      ).resolves.not.toThrow();

      expect(sseManager.pushToUsers).not.toHaveBeenCalled();
    });
  });

  describe('handleActivityClosed', () => {
    it('should create notification and push SSE event', async () => {
      mockRepository.createActivityNotification.mockResolvedValue({ id: 'notif-2', type: 'ACTIVITY_CLOSED' });

      await listener.handleActivityClosed(
        new ActivityClosedPayload('activity-2', ['student-1', 'student-2']),
      );

      expect(repository.createActivityNotification).toHaveBeenCalledWith(
        'ACTIVITY_CLOSED',
        'activity-2',
        ['student-1', 'student-2'],
      );
      expect(sseManager.pushToUsers).toHaveBeenCalledWith(
        ['student-1', 'student-2'],
        expect.objectContaining({ event: 'ACTIVITY_CLOSED' }),
      );
    });
  });

  describe('handleActivityCorrected', () => {
    it('should create notification and push SSE event', async () => {
      mockRepository.createActivityNotification.mockResolvedValue({ id: 'notif-3', type: 'ACTIVITY_CORRECTED' });

      await listener.handleActivityCorrected(
        new ActivityCorrectedPayload('activity-3', ['student-1']),
      );

      expect(repository.createActivityNotification).toHaveBeenCalledWith(
        'ACTIVITY_CORRECTED',
        'activity-3',
        ['student-1'],
      );
      expect(sseManager.pushToUsers).toHaveBeenCalledWith(
        ['student-1'],
        expect.objectContaining({ event: 'ACTIVITY_CORRECTED' }),
      );
    });
  });

  describe('handleTeacherRequestStatus', () => {
    it('should create notification and push SSE event with reason', async () => {
      mockRepository.createTeacherRequestNotification.mockResolvedValue({ id: 'notif-4' });

      await listener.handleTeacherRequestStatus(
        new TeacherRequestStatusPayload('req-1', 'user-1', true, 'Approved'),
      );

      expect(repository.createTeacherRequestNotification).toHaveBeenCalledWith(
        'req-1',
        ['user-1'],
        'Approved',
      );
      expect(sseManager.pushToUser).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ event: 'TEACHER_REQUEST_STATUS' }),
      );

      const sseData = JSON.parse((sseManager.pushToUser as ReturnType<typeof vi.fn>).mock.calls[0][1].data);
      expect(sseData).toEqual({
        id: 'notif-4',
        type: 'TEACHER_REQUEST_STATUS',
        read: false,
        teacherRequestId: 'req-1',
        reason: 'Approved',
      });
    });

    it('should create notification without reason', async () => {
      mockRepository.createTeacherRequestNotification.mockResolvedValue({ id: 'notif-5' });

      await listener.handleTeacherRequestStatus(
        new TeacherRequestStatusPayload('req-2', 'user-2', false, undefined),
      );

      expect(repository.createTeacherRequestNotification).toHaveBeenCalledWith(
        'req-2',
        ['user-2'],
        undefined,
      );
    });

    it('should handle repository errors gracefully', async () => {
      mockRepository.createTeacherRequestNotification.mockRejectedValue(new Error('DB error'));

      await expect(
        listener.handleTeacherRequestStatus(
          new TeacherRequestStatusPayload('req-1', 'user-1', true),
        ),
      ).resolves.not.toThrow();

      expect(sseManager.pushToUser).not.toHaveBeenCalled();
    });
  });

  describe('all activity types coverage', () => {
    it('should handle ACTIVITY_CLOSED event data correctly', async () => {
      mockRepository.createActivityNotification.mockResolvedValue({ id: 'notif-closed' });

      await listener.handleActivityClosed(
        new ActivityClosedPayload('act-closed', ['student-1']),
      );

      const sseData = JSON.parse((sseManager.pushToUsers as ReturnType<typeof vi.fn>).mock.calls[0][1].data);
      expect(sseData.type).toBe('ACTIVITY_CLOSED');
      expect(sseData.activityId).toBe('act-closed');
      expect(sseData.read).toBe(false);
    });

    it('should handle ACTIVITY_CORRECTED event data correctly', async () => {
      mockRepository.createActivityNotification.mockResolvedValue({ id: 'notif-corrected' });

      await listener.handleActivityCorrected(
        new ActivityCorrectedPayload('act-corrected', ['student-2']),
      );

      const sseData = JSON.parse((sseManager.pushToUsers as ReturnType<typeof vi.fn>).mock.calls[0][1].data);
      expect(sseData.type).toBe('ACTIVITY_CORRECTED');
      expect(sseData.activityId).toBe('act-corrected');
    });
  });
});
