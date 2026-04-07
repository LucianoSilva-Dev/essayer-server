import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable().optional(),
});

export class ProfileDto extends createZodDto(profileSchema) {}
