import { z } from "zod";
import { createZodDto } from "nestjs-zod";

const ProvideFeedbackSchema = z.object({
  gradeC1: z
    .number()
    .min(0)
    .max(100),
  gradeC2: z
    .number()
    .min(0)
    .max(100),
  gradeC3: z
    .number()
    .min(0)
    .max(100),
  gradeC4: z
    .number()
    .min(0)
    .max(100),
  gradeC5: z
    .number()
    .min(0)
    .max(100),
  feedbackC1: z
    .string()
    .min(1),
  feedbackC2: z
    .string()
    .min(1),
  feedbackC3: z
    .string()
    .min(1),
  feedbackC4: z
    .string()
    .min(1),
  feedbackC5: z
    .string()
    .min(1),
});

export class ProvideFeedbackDto extends createZodDto(
  ProvideFeedbackSchema
) {}
