import { NotificationType, PrismaService } from '@core/prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByRecipientUserId(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        senders: {
          some: { id: userId },
        },
      },
      include: {
        seenBy: {
          select: { id: true },
        },
        activityNotification: {
          include: {
            activity: true,
          },
        },
        teacherRequestStatus: {
          include: {
            teacherRequest: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(userId: string, notificationIds: string[]) {
    await Promise.all(
      notificationIds.map((id) =>
        this.prisma.notification.update({
          where: { id },
          data: {
            seenBy: {
              connect: { id: userId },
            },
          },
        }),
      ),
    );
  }

  createActivityNotification(type: NotificationType, activityId: string, recipientIds: string[]) {
    return this.prisma.notification.create({
      data: {
        type,
        senders: {
          connect: recipientIds.map((id) => ({ id })),
        },
        activityNotification: {
          create: {
            activityId,
          },
        },
      },
    });
  }

  createTeacherRequestNotification(
    teacherRequestId: string,
    recipientIds: string[],
    reason?: string,
  ) {
    return this.prisma.notification.create({
      data: {
        type: 'TEACHER_REQUEST_STATUS',
        senders: {
          connect: recipientIds.map((id) => ({ id })),
        },
        teacherRequestStatus: {
          create: {
            teacherRequestId,
            motivo: reason,
          },
        },
      },
    });
  }
}
