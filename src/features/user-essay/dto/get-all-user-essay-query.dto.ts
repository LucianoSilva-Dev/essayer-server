import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const getAllUserEssayQuerySchema = z.object({
  theme: z.string().trim().min(1).optional(),
});

export class GetAllUserEssayQueryDto extends createZodDto(getAllUserEssayQuerySchema) {}
