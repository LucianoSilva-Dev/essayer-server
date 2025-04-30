import z from 'zod';

export const getAllRepertorioResponse = z.discriminatedUnion('tipoRepertorio', [
  z.object({
    tipoRepertorio: z.literal('obra'),
    id: z.string(),
    titulo: z.string(),
    sinopse: z.string(),
    autor: z.string(),
    tipo: z.enum(['livro', 'filme', 'música', 'teatro']),
    subtopicos: z.array(z.string()),
  }),
  z.object({
    tipoRepertorio: z.literal('artigo'),
    id: z.string(),
    titulo: z.string(),
    fonte: z.string(),
    resumo: z.string(),
    subtopicos: z.array(z.string()),
  }),
  z.object({
    tipoRepertorio: z.literal('citacao'),
    id: z.string(),
    frase: z.string(),
    autor: z.string(),
    fonte: z.string().optional(),
    subtopicos: z.array(z.string()),
  }),
]);
