import { articleResponseSchema } from "@features/article/dto/article-response.dto";
import { citationResponseSchema } from "@features/citation/dto/citation-response.dto";
import { workResponseSchema } from "@features/work/dto/work-response.dto";
import { createZodDto } from "nestjs-zod";
import z from "zod";


export const repertoireResponseSchema = z.discriminatedUnion("repertoireType", [
  workResponseSchema.extend({ repertoireType: z.literal('WORK') }),
  articleResponseSchema.extend({ repertoireType: z.literal('ARTICLE') }),
  citationResponseSchema.extend({ repertoireType: z.literal('CITATION') }),
]);


export const paginationSchema = z.object({
  offset: z.number().int().min(0),
  limit: z.number().int().min(1).max(15),
  nextPageUrl: z.string().nullable(),
  previousPageUrl: z.string().nullable(),
  totalDocuments: z.number().int(),
});

export const getAllRepertoireResponseSchema = z.object({
  documents: repertoireResponseSchema.array().nullable(),
  pagination: paginationSchema,
});

export class GetAllRepertoireResponseDto extends createZodDto(getAllRepertoireResponseSchema) { }

// `repertoireResponseSchema` is a discriminated union (Obra | Artigo | Citacao),
// so generic `createZodDto` class generation is not supported in this module.
// If needed, use specific schemas directly in controller/service.

