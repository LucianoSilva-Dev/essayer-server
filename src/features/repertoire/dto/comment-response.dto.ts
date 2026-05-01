import { profileSchema } from '@features/user/dto/profile.dto';
import { dateToIsoString } from '@common/schema/date-to-string';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const commentResponseSchema = z.object({
  id: z.string(),
  text: z.string(),
  fixed: z.boolean(),
  createdAt: dateToIsoString,
  updatedAt: dateToIsoString,
  user: profileSchema,
});

export class CommentResponseDto extends createZodDto(commentResponseSchema) {}
