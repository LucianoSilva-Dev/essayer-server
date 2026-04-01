import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const createUserEssaySchema = z.object({
  theme: z
    .string()
    .min(1, "Theme cannot be empty."),
  duration: z
    .number()
    .optional(),
  text: z.string().optional(),
});

export class CreateUserEssayDto extends createZodDto(createUserEssaySchema) {}
