import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const CreateEssayActivitySchema = z.object({
  title: z.string().min(1, 'The title field cannot be empty.'),
  description: z.string().min(1, 'The description field cannot be empty.'),
  classId: z.uuid(),
  theme: z.string().min(1, 'The theme field cannot be empty.'),
  deadline: z.iso.datetime().optional(),
  timeLimitInMinutes: z.number().optional(),
});

export class CreateEssayActivityDto extends createZodDto(CreateEssayActivitySchema) {}
