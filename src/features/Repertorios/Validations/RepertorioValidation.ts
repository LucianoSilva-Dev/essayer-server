import z from 'zod';
import { perfilUsuarioResponse } from './Commom';

export const getAllRepertoriosResponse = z.discriminatedUnion('tipoRepertorio', [
  z.object({
    tipoRepertorio: z.literal('obra'),
    id: z.string(),
    titulo: z.string(),
    sinopse: z.string(),
    autor: z.string(),
    criador: perfilUsuarioResponse,
    tipo: z.enum(['livro', 'filme', 'música', 'teatro']),
    subtopicos: z.array(z.string()),
    favoritadoPeloUsuario: z.boolean(),
    likeDoUsuario: z.boolean()
  }),
  z.object({
    tipoRepertorio: z.literal('artigo'),
    id: z.string(),
    titulo: z.string(),
    fonte: z.string(),
    resumo: z.string(),
    criador: perfilUsuarioResponse,
    subtopicos: z.array(z.string()),
    favoritadoPeloUsuario: z.boolean(),
    likeDoUsuario: z.boolean()
  }),
  z.object({
    tipoRepertorio: z.literal('citacao'),
    id: z.string(),
    frase: z.string(),
    autor: z.string(),
    fonte: z.string().optional(),
    criador: perfilUsuarioResponse,
    subtopicos: z.array(z.string()),
    favoritadoPeloUsuario: z.boolean(),
    likeDoUsuario: z.boolean()
  }),
]);
