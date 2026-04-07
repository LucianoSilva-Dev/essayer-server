import { createZodDto } from 'nestjs-zod';
import { createWorkSchema } from './create-work.dto';

const updateWorkSchema = createWorkSchema.partial();

export class UpdateWorkDto extends createZodDto(updateWorkSchema) {}
