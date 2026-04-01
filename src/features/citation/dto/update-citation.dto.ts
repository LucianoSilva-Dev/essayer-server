import { createZodDto } from 'nestjs-zod';
import { createCitationSchema } from './create-citation.dto';

const updateCitationSchema = createCitationSchema.partial();

export class UpdateCitationDto extends createZodDto(updateCitationSchema) { }
