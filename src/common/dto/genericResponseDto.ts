import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class GenericSuccessResponseDto extends createZodDto(
  z.object({
    message: z.string(),
  }),
) {}
