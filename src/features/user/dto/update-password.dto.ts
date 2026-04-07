import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*\d).{8,24}$/,
      'Password must be 8-24 characters long and include at least one lowercase letter and one number.',
    )
    .nonempty('The password cannot be empty.'),
});

export class UpdatePasswordDto extends createZodDto(updatePasswordSchema) {}
