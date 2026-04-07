import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createCommentSchema = z.object({
  text: z.string(),
  fix: z.boolean().optional(),
});

export class CreateCommentDto extends createZodDto(createCommentSchema) {}
