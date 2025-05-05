import z from 'zod';

export const comentarioResponse = z.object({
  usuario: z.object({
    id: z.string(),
    nome: z.string(),
    fotoPerfil: z.string(),
  }),
  texto: z.string()
});

export const perfilUsuarioResponse = z.object({
  id: z.string(),
  nome: z.string(),
  fotoPerfil: z.string(),
});

export const paginacaoResponse = z.object({
  offset: z.number().int().min(0),
  limit: z.number().int().min(1).max(15),
  nextPageUrl: z.string().nullable(),
  previousPageUrl: z.string().nullable(),
  totalDocuments: z.number().int(),
})
