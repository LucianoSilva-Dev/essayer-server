import z from 'zod';

export const feedbackDoc = z.object({
  gradeC1: z.number(),
  gradeC2: z.number(),
  gradeC3: z.number(),
  gradeC4: z.number(),
  gradeC5: z.number(),
  feedbackC1: z.string(),
  feedbackC2: z.string(),
  feedbackC3: z.string(),
  feedbackC4: z.string(),
  feedbackC5: z.string(),
});
