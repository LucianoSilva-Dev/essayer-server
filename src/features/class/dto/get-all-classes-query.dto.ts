import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const getAllClassesQuerySchema = z.object({
  offset: z.coerce
    .number()
    .int()
    .min(0)
    .nullish()
    .transform((val) => val ?? 0),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(15)
    .nullish()
    .transform((val) => val ?? 15),
});

export class GetAllClassesQueryDto extends createZodDto(getAllClassesQuerySchema) {}
