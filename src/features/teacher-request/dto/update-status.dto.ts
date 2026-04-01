import { createZodDto } from "nestjs-zod";
import z from "zod";

export const updateStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REFUSED']),
  reason: z.string().optional()
});

export class UpdateStatusDto extends createZodDto(updateStatusSchema) {}
