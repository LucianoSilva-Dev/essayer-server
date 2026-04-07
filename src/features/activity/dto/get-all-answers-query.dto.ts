import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const GetAllAnswersQuerySchema = z.object({
  offset: z
    .string()
    .default('0')
    .transform((val) => parseInt(val))
    .refine((val) => val >= 0, 'offset must be non-negative'),
  limit: z
    .string()
    .default('10')
    .transform((val) => parseInt(val))
    .refine((val) => val > 0, 'limit must be positive'),
});

export class GetAllAnswersQueryDto extends createZodDto(GetAllAnswersQuerySchema) {}
