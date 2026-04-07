import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const notificationResponseSchema = z.object({
  id: z.string(),
  type: z.enum([
    'ACTIVITY_SENT',
    'ACTIVITY_CLOSED',
    'ACTIVITY_CORRECTED',
    'TEACHER_REQUEST_STATUS',
  ]),
  read: z.boolean(),
  activityId: z.string().optional(),
  teacherRequestId: z.string().optional(),
  reason: z.string().optional(),
});

export class NotificationResponseDto extends createZodDto(notificationResponseSchema) {}
