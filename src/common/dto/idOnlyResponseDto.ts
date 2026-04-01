import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const IdOnlyResponseSchema = z.object({
  id: z.uuid(),
});

export class IdOnlyResponseDto extends createZodDto(IdOnlyResponseSchema) {}
