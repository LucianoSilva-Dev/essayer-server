import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateUserEssaySchema = z
  .object({
    text: z.string().optional(),
    duration: z.number().optional(),
    finished: z.boolean().optional(),
    date: z.iso.datetime().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update.',
  });

export class UpdateUserEssayDto extends createZodDto(updateUserEssaySchema) {}
