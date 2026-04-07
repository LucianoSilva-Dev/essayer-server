import z from 'zod';

export const essayCorrectionResultSchema = z.object({
  gradeC1: z.number().int(),
  gradeC2: z.number().int(),
  gradeC3: z.number().int(),
  gradeC4: z.number().int(),
  gradeC5: z.number().int(),
  feedbackC1: z.string(),
  feedbackC2: z.string(),
  feedbackC3: z.string(),
  feedbackC4: z.string(),
  feedbackC5: z.string(),
});

export type EssayCorrectionResult = z.infer<typeof essayCorrectionResultSchema>;

export interface IEssayCorrectionJobData {
  essayId: string;
  correctionId: string;
  theme: string;
  text: string;
  userId: string;
}
