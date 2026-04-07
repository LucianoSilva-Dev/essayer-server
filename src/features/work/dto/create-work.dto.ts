import { WorkType } from '@core/prisma';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createWorkSchema = z.object({
  title: z.string(),
  synopsis: z.string(),
  author: z.string(),
  workType: z.enum(WorkType),
  subtopics: z.array(z.string()).min(1, 'The subtopics field needs at least 1 subtopic'),

  topics: z.array(z.string()).min(1, 'The topics field needs at least 1 topic'),
});

export class CreateWorkDto extends createZodDto(createWorkSchema) {}
