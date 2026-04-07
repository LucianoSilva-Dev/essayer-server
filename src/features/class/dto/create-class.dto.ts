import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createClassSchema = z.object({
  name: z.string().nonempty('The name field cannot be empty'),
  iconId: z.string().nonempty('The iconId field cannot be empty'),
  school: z.string().nullish(),
});

export class CreateClassDto extends createZodDto(createClassSchema) {}
