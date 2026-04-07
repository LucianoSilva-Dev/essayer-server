import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const UpdateEssayActivitySchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    theme: z.string().min(1).optional(),
    deadline: z.iso.datetime().optional(),
    timeLimitInMinutes: z.number().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update.',
  });

export class UpdateEssayActivityDto extends createZodDto(UpdateEssayActivitySchema) {}
