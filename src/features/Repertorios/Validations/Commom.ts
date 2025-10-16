import z, { boolean } from 'zod';

export const perfilUsuarioResponse = z.object({
  id: z.string(),
  nome: z.string(),
  fotoPath: z.string().nullable().optional()
});

export const comentarioResponse = z.object({
  id: z.string(),
  usuario: perfilUsuarioResponse,
  texto: z.string(),
  fixado: boolean(),
});

export const paginacaoResponse = z.object({
  offset: z.number().int().min(0),
  limit: z.number().int().min(1).max(15),
  nextPageUrl: z.string().nullable(),
  previousPageUrl: z.string().nullable(),
  totalDocuments: z.number().int(),
});
