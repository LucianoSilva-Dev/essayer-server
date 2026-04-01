import { z } from "zod";
import { createZodDto } from "nestjs-zod";

const SubmitEssayResponseSchema = z.object({
  text: z
    .string()
    .min(1, "The text field cannot be empty."),
});

export class SubmitEssayResponseDto extends createZodDto(
  SubmitEssayResponseSchema
) {}
