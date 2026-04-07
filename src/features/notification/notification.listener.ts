import {
  ActivityClosedPayload,
  ActivityCorrectedPayload,
  ActivitySubmittedPayload,
  TeacherRequestStatusPayload,
} from '@core/events';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationRepository } from './notification.repository';
import { SseConnectionsManager } from './sse-connections.manager';

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(
    private readonly repository: NotificationRepository,
    private readonly sseManager: SseConnectionsManager,
  ) {}

  @OnEvent('activity.submitted', { async: true })
  async handleActivitySubmitted(payload: ActivitySubmittedPayload) {
    try {
      const notification = await this.repository.createActivityNotification(
        'ACTIVITY_SENT',
        payload.activityId,
        payload.recipients,
      );

      this.sseManager.pushToUsers(payload.recipients, {
        event: 'ACTIVITY_SENT',
        data: JSON.stringify({
          id: notification.id,
          type: 'ACTIVITY_SENT',
          read: false,
          activityId: payload.activityId,
        }),
      });
    } catch (err) {
      this.logger.error('Failed to create ACTIVITY_SENT notification', err);
    }
  }

  @OnEvent('activity.closed', { async: true })
  async handleActivityClosed(payload: ActivityClosedPayload) {
    try {
      const notification = await this.repository.createActivityNotification(
        'ACTIVITY_CLOSED',
        payload.activityId,
        payload.recipients,
      );

      this.sseManager.pushToUsers(payload.recipients, {
        event: 'ACTIVITY_CLOSED',
        data: JSON.stringify({
          id: notification.id,
          type: 'ACTIVITY_CLOSED',
          read: false,
          activityId: payload.activityId,
        }),
      });
    } catch (err) {
      this.logger.error('Failed to create ACTIVITY_CLOSED notification', err);
    }
  }

  @OnEvent('activity.corrected', { async: true })
  async handleActivityCorrected(payload: ActivityCorrectedPayload) {
    try {
      const notification = await this.repository.createActivityNotification(
        'ACTIVITY_CORRECTED',
        payload.activityId,
        payload.recipients,
      );

      this.sseManager.pushToUsers(payload.recipients, {
        event: 'ACTIVITY_CORRECTED',
        data: JSON.stringify({
          id: notification.id,
          type: 'ACTIVITY_CORRECTED',
          read: false,
          activityId: payload.activityId,
        }),
      });
    } catch (err) {
      this.logger.error('Failed to create ACTIVITY_CORRECTED notification', err);
    }
  }

  @OnEvent('teacher-request.status', { async: true })
  async handleTeacherRequestStatus(payload: TeacherRequestStatusPayload) {
    try {
      const notification = await this.repository.createTeacherRequestNotification(
        payload.requestId,
        [payload.userId],
        payload.reason,
      );

      this.sseManager.pushToUser(payload.userId, {
        event: 'TEACHER_REQUEST_STATUS',
        data: JSON.stringify({
          id: notification.id,
          type: 'TEACHER_REQUEST_STATUS',
          read: false,
          teacherRequestId: payload.requestId,
          reason: payload.reason,
        }),
      });
    } catch (err) {
      this.logger.error('Failed to create TEACHER_REQUEST_STATUS notification', err);
    }
  }
}
