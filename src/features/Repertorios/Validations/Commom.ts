import z, { boolean } from 'zod';
import { perfilUsuarioResponse } from '../../../shared/Validations';

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
