import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const changeStatusSchema = z.object({
  notificationIds: z.array(z.string().min(1)).min(1),
});

export class ChangeStatusDto extends createZodDto(changeStatusSchema) {}
