import { WorkType } from '@core/prisma';
import { profileSchema } from '@features/user/dto/profile.dto';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const workResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  synopsis: z.string(),
  author: z.string(),
  creator: profileSchema,
  totalLikes: z.number(),
  comments: z.array(profileSchema),
  totalComments: z.number(),
  subtopics: z.array(z.string()),
  topics: z.array(z.string()),
  workType: z.enum(WorkType),
  favourited: z.boolean(),
  liked: z.boolean(),
});

export class WorkResponseDto extends createZodDto(workResponseSchema) {}
