import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const fixCommentSchema = z.object({
  fix: z.boolean(),
});

export class FixCommentDto extends createZodDto(fixCommentSchema) {}
