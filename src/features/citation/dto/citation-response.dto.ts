import { profileSchema } from '@features/user/dto/profile.dto';
import { commentResponseSchema } from '@features/repertoire/dto/comment-response.dto';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const citationResponseSchema = z.object({
  id: z.string(),
  quote: z.string(),
  author: z.string(),
  source: z.string().nullable(),
  creator: profileSchema,
  totalLikes: z.number(),
  comments: z.array(commentResponseSchema),
  totalComments: z.number(),
  subtopics: z.array(z.string()),
  topics: z.array(z.string()),
  favourited: z.boolean(),
  liked: z.boolean(),
});

export class CitationResponseDto extends createZodDto(citationResponseSchema) {}

