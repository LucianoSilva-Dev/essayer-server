import { createZodDto } from "nestjs-zod";
import z from "zod";

export const updateCommentSchema = z.object({
  text: z.string(),
});

export class UpdateCommentDto extends createZodDto(updateCommentSchema) {}
