import { createZodDto } from "nestjs-zod";
import z from "zod";

export const joinClassSchema = z.object({
  inviteCode: z
    .string()
    .nonempty('The invite code cannot be empty'),
});

export class JoinClassDto extends createZodDto(joinClassSchema) {}