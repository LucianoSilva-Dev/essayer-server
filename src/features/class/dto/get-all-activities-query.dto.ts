import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const getAllActivitiesQuerySchema = z.object({
  title: z.string().nonempty('The title field cannot be empty').optional(),
});

export class GetAllActivitiesQueryDto extends createZodDto(getAllActivitiesQuerySchema) {}
