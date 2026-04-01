import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const NullResponseDto = createZodDto(z.null());
