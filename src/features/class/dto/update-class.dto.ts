import { createZodDto } from 'nestjs-zod';
import { createClassSchema } from './create-class.dto';

export const updateClassSchema = createClassSchema.partial();

export class UpdateClassDto extends createZodDto(updateClassSchema) {}
