import { dateToIsoString } from '@common/schema/date-to-string';
import { RequestStatus } from '@core/prisma';
import { profileSchema } from '@features/user/dto/profile.dto';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const teacherRequestResponseSchema = z.object({
  id: z.string(),
  lattes: z.string(),
  requester: profileSchema.nullable(),
  reviewer: profileSchema.nullable(),
  status: z.enum(RequestStatus).nullable(),
  createdAt: dateToIsoString,
});

export class TeacherRequestResponseDto extends createZodDto(teacherRequestResponseSchema) {}
