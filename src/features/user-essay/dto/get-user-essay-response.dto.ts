import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { dateToIsoString } from '@common/schema/date-to-string';

export const getUserEssayResponseSchema = z.object({
  id: z.string(),
  theme: z.string(),
  text: z.string().optional(),
  duration: z.number().optional(),
  date: dateToIsoString,
  finished: z.boolean(),
  createdAt: dateToIsoString,
  updatedAt: dateToIsoString,
});

export class GetUserEssayResponseDto extends createZodDto(getUserEssayResponseSchema) {}
