import z from 'zod';
import { paginacaoResponse, perfilUsuarioResponse } from './Commom';
import { isValidObjectId } from 'mongoose';

export const getAllRepertorioObraDoc = z.object({
  tipoRepertorio: z.literal('Obra'),
  id: z.string(),
  titulo: z.string(),
  sinopse: z.string(),
  autor: z.string(),
  criador: perfilUsuarioResponse,
  tipoObra: z.enum(['livro', 'filme', 'música', 'teatro']),
  subtopicos: z.array(z.string()),
  favoritadoPeloUsuario: z.boolean(),
  likeDoUsuario: z.boolean(),
});

export const getAllRepertorioArtigoDoc = z.object({
  tipoRepertorio: z.literal('Artigo'),
  id: z.string(),
  titulo: z.string(),
  fonte: z.string(),
  resumo: z.string(),
  criador: perfilUsuarioResponse,
  subtopicos: z.array(z.string()),
  favoritadoPeloUsuario: z.boolean(),
  likeDoUsuario: z.boolean(),
});

export const getAllRepertorioCitacaoDoc = z.object({
  tipoRepertorio: z.literal('Citacao'),
  id: z.string(),
  frase: z.string(),
  autor: z.string(),
  fonte: z.string().optional(),
  criador: perfilUsuarioResponse,
  subtopicos: z.array(z.string()),
  favoritadoPeloUsuario: z.boolean(),
  likeDoUsuario: z.boolean(),
});

export const getAllRepertorioDocuments = z.array(
  z
    .discriminatedUnion('tipoRepertorio', [
      getAllRepertorioObraDoc,
      getAllRepertorioArtigoDoc,
      getAllRepertorioCitacaoDoc,
    ])
    .optional(),
);

export const getAllRepertorioResponse = z.object({
  documentos: getAllRepertorioDocuments,
  paginacao: paginacaoResponse,
});

export const createComentarioBodyValidation = z.object({
  tipoRepertorio: z.enum(['obra', 'artigo', 'citacao']),
  texto: z.string({
    required_error: 'O campo texto do comentario é obrigatório',
    invalid_type_error: 'O campo "texto" do comentario não é um texto',
  }),
});

export const getAllRepertorioQueryValidation = z.object({
  // opções de filtragem
  tipoRepertorio: z
    .set(
      z.enum(['Obra', 'Artigo', 'Citacao'], {
        message:
          'O campo tipoRepertorio só pode conter "Obra", "Artigo", ou "Citacao"',
      }),
      { message: 'O campo tipoRepertorio não pode conter valores duplicados' },
    )
    .nonempty('O campo tipoRepertorio não pode estar vazio')
    .optional(),

  conteudo: z
    .string({
      invalid_type_error: 'O campo conteudo precisa ser um texto',
    })
    .nonempty('O campo conteudo não pode estar vazio')
    .optional(),

  subtopicos: z
    .array(
      z.string({
        invalid_type_error: 'O campo subtopicos precisa ser um texto.',
      }),
    )
    .min(1, 'O campo subtopicos precisa conter ao menos um subtópico.')
    .optional(),

  criador: z
    .string({
      required_error: 'O campo criador não pode estar vazio',
      invalid_type_error: 'O campo criador precisa ser um texto',
    })
    .refine((value) => isValidObjectId(value), {
      message: 'O campo criador não é um ID válido',
    })
    .optional(),

  favoritadoPeloUsuario: z
    .boolean({
      coerce: true,
      invalid_type_error:
        'O campo favoritadoPeloUsuario só pode ser verdadeiro ou falso',
    })
    .optional(),

  likeDoUsuario: z
    .boolean({
      coerce: true,
      invalid_type_error:
        'O campo likeDoSUsuario só pode ser verdadeiro ou falso',
    })
    .optional(),

  // Ordenação
  ordernarPor: z.enum(['MaxLikes', 'MinLikes', 'Newest', 'Oldest']).optional(),

  // paginação
  offset: z
    .number({coerce: true})
    .int()
    .min(0)
    .nullish()
    .transform((val) => val ?? 0),
  limit: z
    .number({coerce: true})
    .int()
    .min(1)
    .max(15)
    .nullish()
    .transform((val) => val ?? 15),
});
