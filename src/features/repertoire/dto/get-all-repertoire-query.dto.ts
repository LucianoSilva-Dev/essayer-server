import { RepertoireType } from "@core/prisma";
import { createZodDto } from "nestjs-zod";
import z from "zod";

export const getAllRepertoireQuerySchema = z.object({
  reperoireType: z
    .union([
      z
        .array(z.enum(RepertoireType)),
      z.enum(RepertoireType),
    ])
    .optional(),

  content: z
    .string()
    .min(1, "field 'content' cannot be empty")
    .optional(),

  subtopics: z
    .union([
      z.string().transform((val) => [val]),
      z.array(z.string()).min(1, "The subtopics field needs at least 1 subtopic"),
    ])
    .optional(),

  topics: z
    .union([
      z.string(),
      z.array(z.string()).min(1, "The topics field needs at least 1 topic"),
    ])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),

  creator: z.string().optional(),

  favourited: z.preprocess(
    (val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    },
    z.boolean().optional(),
  ),

  liked: z.preprocess(
    (val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    },
    z.boolean().optional(),
  ),

  orderBy: z.enum(["MaxLikes", "MinLikes", "Newest", "Oldest"] as const).optional(),

  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(15).default(15),
});

export class GetAllRepertoireQueryDto extends createZodDto(getAllRepertoireQuerySchema) { }
