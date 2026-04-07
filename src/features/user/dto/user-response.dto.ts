import { dateToIsoString } from '@common/schema/date-to-string';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const userResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().nullable(),
  email: z.string(),
  createdAt: dateToIsoString,
  lattes: z.string().nullable(),
});

export class UserResponseDto extends createZodDto(userResponseSchema) {}
