import { createZodDto } from 'nestjs-zod';
import { createArticleSchema } from './create-article.dto';

const updateArticleSchema = createArticleSchema.partial();

export class UpdateArticleDto extends createZodDto(updateArticleSchema) { }
