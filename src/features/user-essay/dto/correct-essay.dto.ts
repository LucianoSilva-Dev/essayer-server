import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const correctEssaySchema = z.object({
  theme: z.string().min(1),
  essayText: z.string().min(1),
}).meta({ id: 'correctEssay' });

export class CorrectEssayDto extends createZodDto(correctEssaySchema) {}
