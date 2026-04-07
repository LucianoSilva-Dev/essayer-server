import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const aiCorrectionFinishedSchema = z.object({
  id: z.string(),
  status: z.literal('FINISHED'),
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
  createdAt: z.string(),
}).meta({ id: 'aiCorrectionFinished' });

const aiCorrectionPendingSchema = z.object({
  id: z.string(),
  status: z.literal('PENDING'),
  createdAt: z.string(),
}).meta({ id: 'aiCorrectionPending' });

const aiCorrectionErrorSchema = z.object({
  id: z.string(),
  status: z.literal('ERROR'),
  createdAt: z.string(),
}).meta({ id: 'aiCorrectionError' });

const aiCorrectionResponseSchema = z.object({
  id: z.string(),
  status: z.enum(['FINISHED', 'PENDING', 'ERROR']),
  createdAt: z.string(),
}).meta({ id: 'aiCorrection' });

export class AiCorrectionResponseDto extends createZodDto(aiCorrectionResponseSchema) {}
