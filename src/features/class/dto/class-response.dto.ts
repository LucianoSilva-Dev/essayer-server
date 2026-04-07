import { profileSchema } from '@features/user/dto/profile.dto';
import { ActivityType } from '@core/prisma';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { feedbackDoc } from '@common/schema/feedback';
import { dateToIsoString } from '@common/schema/date-to-string';

export const getClassResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  iconId: z.string(),
  school: z.string().nullable().default(null),
  creator: profileSchema,
  members: z.array(profileSchema),
  totalMembers: z.number(),
});

export const getClassesResponseSchema = z.object({
  documents: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      iconId: z.string(),
      school: z.string().nullable().default(null),
      creator: profileSchema,
    }),
  ),

  pagination: z.object({
    offset: z.coerce.number().int().min(0),
    limit: z.coerce.number().int().min(1).max(15),
    nextPageUrl: z.string().nullable(),
    previousPageUrl: z.string().nullable(),
    totalDocuments: z.number().int(),
    pagesUrl: z.array(z.string()),
  }),
});

export const getCreatedClassesResponseSchema = z.object({
  documents: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      iconId: z.string(),
      school: z.string().nullable().default(null),
    }),
  ),
  pagination: z.object({
    offset: z.coerce.number().int().min(0),
    limit: z.coerce.number().int().min(1).max(15),
    nextPageUrl: z.string().nullable(),
    previousPageUrl: z.string().nullable(),
    totalDocuments: z.number().int(),
    pagesUrl: z.array(z.string()),
  }),
});

export const getInviteCodeResponseSchema = z.object({
  code: z.string(),
});

export const getStudentsResponseSchema = z.array(profileSchema);

export const getPendingStudentsResponseSchema = z.array(profileSchema);

export const regenerateCodeResponseSchema = z.object({
  code: z.string(),
});

export const getActivitiesResponseSchema = z.array(
  z.object({
    id: z.string(),
    activityType: z.enum(ActivityType),
    title: z.string(),
    description: z.string(),
    deadline: dateToIsoString.nullable(),
    status: z.string(),
  }),
);

export const getCreatorActivitiesResponseSchema = z.array(
  z.object({
    id: z.string(),
    activityType: z.enum(ActivityType),
    title: z.string(),
    description: z.string(),
    deadline: dateToIsoString.nullable(),
    usersResponded: z.array(profileSchema),
    totalMembers: z.number(),
  }),
);

export const getAllFeedbacksResponseSchema = z.array(
  z.object({
    id: z.string(),
    feedback: feedbackDoc,
    seen: z.boolean(),
    date: dateToIsoString,
    activity: z.object({
      id: z.string(),
      title: z.string(),
      activityType: z.enum(ActivityType),
    }),
  }),
);

export class GetClassResponseDto extends createZodDto(getClassResponseSchema) {}
export class GetClassesResponseDto extends createZodDto(getClassesResponseSchema) {}
export class GetCreatedClassesResponseDto extends createZodDto(getCreatedClassesResponseSchema) {}
export class GetInviteCodeResponseDto extends createZodDto(getInviteCodeResponseSchema) {}
export class GetStudentsResponseDto extends createZodDto(getStudentsResponseSchema) {}
export class GetPendingStudentsResponseDto extends createZodDto(getPendingStudentsResponseSchema) {}
export class RegenerateCodeResponseDto extends createZodDto(regenerateCodeResponseSchema) {}
export class GetActivitiesResponseDto extends createZodDto(getActivitiesResponseSchema) {}
export class GetCreatorActivitiesResponseDto extends createZodDto(
  getCreatorActivitiesResponseSchema,
) {}
export class GetAllFeedbacksResponseDto extends createZodDto(getAllFeedbacksResponseSchema) {}
