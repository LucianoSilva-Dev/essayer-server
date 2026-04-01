import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { feedbackDoc } from "@common/schema/feedback";
import { dateToIsoString } from "@common/schema/date-to-string";


const FeedbackSchema = feedbackDoc.extend({seen: z.boolean().default(false)})

// Essay activity response
const EssayActivityResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  theme: z.string(),
  deadline: dateToIsoString.nullable(),
  timeLimitInMinutes: z.number().nullable(),
  createdAt: dateToIsoString,
  updatedAt: dateToIsoString,
});

// Essay response details
const EssayResponseDetailsSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  text: z.string().optional(),
  answerDate: dateToIsoString.nullable(),
  feedback: FeedbackSchema.optional(),
});

// Get recent activities response
const RecentActivityResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  submittedResponses: z.number(),
  createdAt: dateToIsoString,
  totalStudents: z.number(),
});

// Get all activities for student response
const StudentActivityResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  deadline: dateToIsoString.nullable(),
  activityType: z.literal("ESSAY"),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "SUBMITTED"]),
  class: z.object({
    id: z.string(),
    name: z.string(),
    iconId: z.string().nullable(),
  }),
});

// Get correction response
const CorrectionResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  theme: z.string(),
  text: z.string().optional(),
  feedback: FeedbackSchema.optional(),
});

// Get all answers response
const AnswerDetailSchema = z.object({
  id: z.string(),
  studentName: z.string(),
  studentId: z.string(),
  text: z.string().optional(),
  answerDate: dateToIsoString.nullable(),
  hasFeedback: z.boolean(),
  feedbackSeen: z.boolean().nullable(),
});

const GetAllAnswersResponseSchema = z.array(AnswerDetailSchema);

// Pagination response wrapper
const PaginationSchema = z.object({
  offset: z.number(),
  limit: z.number(),
  nextPageUrl: z.string().nullable(),
  previousPageUrl: z.string().nullable(),
  totalDocuments: z.number(),
  pagesUrl: z.array(z.string()),
});

const PaginatedAnswersResponseSchema = z.object({
  documents: z.array(AnswerDetailSchema),
  pagination: PaginationSchema,
});

// Export DTOs
export class FeedbackDto extends createZodDto(FeedbackSchema) {}
export class EssayActivityResponseDto extends createZodDto(
  EssayActivityResponseSchema
) {}
export class EssayResponseDetailsDto extends createZodDto(
  EssayResponseDetailsSchema
) {}
export class RecentActivityResponseDto extends createZodDto(
  RecentActivityResponseSchema
) {}
export class StudentActivityResponseDto extends createZodDto(
  StudentActivityResponseSchema
) {}
export class CorrectionResponseDto extends createZodDto(
  CorrectionResponseSchema
) {}
export class AnswerDetailDto extends createZodDto(AnswerDetailSchema) {}
export class GetAllAnswersResponseDto extends createZodDto(
  GetAllAnswersResponseSchema
) {}
export class PaginationDto extends createZodDto(PaginationSchema) {}
export class PaginatedAnswersResponseDto extends createZodDto(
  PaginatedAnswersResponseSchema
) {}
