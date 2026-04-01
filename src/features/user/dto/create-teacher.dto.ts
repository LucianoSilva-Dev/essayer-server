import { createZodDto } from "nestjs-zod";
import z from "zod";

export const createTeacherSchema = z.object({
  lattes: z
    .string()
    .nonempty("The lattes cannot be empty."),
});

export class CreateTeacherDto extends createZodDto(createTeacherSchema) { }
