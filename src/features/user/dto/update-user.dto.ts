import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const updateUserSchema = z
  .object({
    name: z.string().nonempty('The name cannot be empty.').optional(),
    lattes: z.string().nonempty('The lattes cannot be empty.').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update.',
  });

export class UpdateUserDto extends createZodDto(updateUserSchema) {}
