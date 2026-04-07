import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createArticleSchema = z.object({
  title: z.string(),
  abstract: z.string(),
  author: z.string(),
  source: z.string().optional(),
  subtopics: z.array(z.string()).min(1, 'The subtopics field needs at least 1 subtopic'),

  topics: z.array(z.string()).min(1, 'The topics field needs at least 1 topic'),
});

export class CreateArticleDto extends createZodDto(createArticleSchema) {}
