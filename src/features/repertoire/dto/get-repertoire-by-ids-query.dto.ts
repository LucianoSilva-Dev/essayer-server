import { createZodDto } from "nestjs-zod";
import z from "zod";

export const getRepertoireByIdsQuerySchema = z.object({
  ids: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (typeof val === "string" ? [val] : val))
    .refine((val) => val.length > 0, "IDs list cannot be empty")
});

export class GetRepertoireByIdsQueryDto extends createZodDto(getRepertoireByIdsQuerySchema) { }
