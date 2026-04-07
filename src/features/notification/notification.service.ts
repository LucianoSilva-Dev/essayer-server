import { Injectable } from "@nestjs/common";
import { Subject, interval, merge, map, finalize } from "rxjs";
import { MessageEvent } from "@nestjs/common";
import { NotificationRepository } from "./notification.repository";
import {
  SseConnectionsManager,
  ISseNotificationEvent,
} from "./sse-connections.manager";
import { ChangeStatusDto } from "./dto/change-status.dto";

@Injectable()
export class NotificationService {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly sseManager: SseConnectionsManager,
  ) {}

  async getAll(userId: string) {
    const notifications = await this.repository.findByRecipientUserId(userId);

    return notifications.map((notification) => {
      const read = notification.seenBy.length > 0;

      if (
        notification.type === "ACTIVITY_SENT" ||
        notification.type === "ACTIVITY_CLOSED" ||
        notification.type === "ACTIVITY_CORRECTED"
      ) {
        return {
          id: notification.id,
          type: notification.type,
          read,
          activityId: notification.activityNotification?.activityId ?? "",
        };
      }

      return {
        id: notification.id,
        type: notification.type as "TEACHER_REQUEST_STATUS",
        read,
        teacherRequestId:
          notification.teacherRequestStatus?.teacherRequestId ?? "",
        reason: notification.teacherRequestStatus?.motivo ?? undefined,
      };
    });
  }

  async changeStatus(userId: string, dto: ChangeStatusDto) {
    await this.repository.markAsRead(userId, dto.notificationIds);
    return null;
  }

  listen(userId: string) {
    const subject = new Subject<ISseNotificationEvent>();

    this.sseManager.addConnection(userId, subject);

    const heartbeatStream = interval(30_000).pipe(
      map(
        () =>
          ({
            type: "heartbeat",
          }) as MessageEvent,
      ),
    );

    const notificationStream = subject.pipe(
      map(
        (event) =>
          ({
            type: event.event,
            data: event.data,
          }) as MessageEvent,
      ),
    );

    return merge(heartbeatStream, notificationStream).pipe(
      finalize(() => {
        this.sseManager.removeConnection(userId, subject);
        subject.complete();
      }),
    );
  }
}
