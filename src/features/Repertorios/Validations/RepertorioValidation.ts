// Backend/src/features/Repertorios/Validations/RepertorioValidation.ts
import z from 'zod';
import { paginacaoResponse, perfilUsuarioResponse } from './Commom';
import { isValidObjectId } from 'mongoose';
import { HasUniqueItens } from '../Helpers/HasUniqueItens';

export const getAllRepertorioObraDoc = z.object({
  tipoRepertorio: z.literal('Obra'),
  id: z.string(),
  totalLikes: z.number(),
  titulo: z.string(),
  sinopse: z.string(),
  autor: z.string(),
  criador: perfilUsuarioResponse,
  tipoObra: z.enum(['livro', 'filme', 'música', 'teatro']),
  subtopicos: z.array(z.string()),
  topicos: z.array(z.string()),
  favoritadoPeloUsuario: z.boolean(),
  likeDoUsuario: z.boolean(),
});

export const getAllRepertorioArtigoDoc = z.object({
  tipoRepertorio: z.literal('Artigo'),
  id: z.string(),
  totalLikes: z.number(),
  titulo: z.string(),
  fonte: z.string(),
  resumo: z.string(),
  autor: z.string(),
  criador: perfilUsuarioResponse,
  subtopicos: z.array(z.string()),
  topicos: z.array(z.string()),
  favoritadoPeloUsuario: z.boolean(),
  likeDoUsuario: z.boolean(),
});

export const getAllRepertorioCitacaoDoc = z.object({
  tipoRepertorio: z.literal('Citacao'),
  id: z.string(),
  totalLikes: z.number(),
  frase: z.string(),
  autor: z.string(),
  fonte: z.string().optional(), // Fonte é opcional
  criador: perfilUsuarioResponse,
  subtopicos: z.array(z.string()),
  topicos: z.array(z.string()),
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
  texto: z.string({
    required_error: 'O campo texto do comentario é obrigatório',
    invalid_type_error: 'O campo texto do comentario não é um texto',
  }),
});

export const getAllRepertorioQueryValidation = z.object({
  // opções de filtragem
  tipoRepertorio: z
    .union([
      z
        .array(
          z.enum(['Obra', 'Artigo', 'Citacao'], {
            message:
              'O campo tipoRepertorio só pode conter "Obra", "Artigo", e "Citacao"',
          }),
        )
        .nonempty('O campo tipoRepertorio precisa conter ao menos um item')
        .refine(
          HasUniqueItens,
          'O campo tipoRepertorio não pode conter valores repetidos',
        ),
      z.enum(['Obra', 'Artigo', 'Citacao'], {
        message:
          'O campo tipoRepertorio só pode conter "Obra", "Artigo", e "Citacao"',
        required_error:
          'O campo tipoRepertorio precisa conter ao menos um item',
      }),
    ])
    .optional(),

  conteudo: z
    .string({
      invalid_type_error: 'O campo conteudo precisa ser um texto',
    })
    .nonempty('O campo conteudo não pode estar vazio')
    .optional(),

  // Subtopicos agora pode vir como uma string única ou array de strings
  subtopicos: z
    .union([
      z.string({
        required_error: "O campo subtopicos precisa conter ao menos um subtópico",
        invalid_type_error: "O campo subtopicos só pode conter texto",
      }).transform(val => [val]), // Converte string para array de uma única string
      z.array(
        z.string({
          required_error:
            'O campo subtopicos precisa conter ao menos um subtópico',
          invalid_type_error: 'O campo subtopicos só pode conter texto',
        }),
      ).min(1, 'O campo subtopicos precisa conter ao menos um subtópico'),
    ])
    .optional(),

  // Topicos agora pode vir como uma string única ou array de strings
  topicos: z
    .union([
      z.string({
        invalid_type_error: 'O campo topicos precisa ser um texto',
      }).nonempty('O campo topicos não pode estar vazio'),
      z.array(
        z.string({
          invalid_type_error: 'O campo topicos precisa ser um texto',
        }).nonempty('O campo topicos não pode estar vazio'),
      ).min(1, 'O campo topicos precisa conter ao menos um item'),
    ])
    .transform((val) => (Array.isArray(val) ? val : [val])) // Normaliza para sempre ser um array
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

  favoritadoPeloUsuario: z.preprocess(
    (val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    },
    z
      .boolean({
        invalid_type_error:
          'O campo favoritadoPeloUsuario só pode ser verdadeiro ou falso',
      })
      .optional(),
  ),

  likeDoUsuario: z.preprocess(
    (val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    },
    z
      .boolean({
        invalid_type_error:
          'O campo likeDoUsuario só pode ser verdadeiro ou falso',
      })
      .optional(),
  ),

  // Ordenação
  ordenarPor: z.enum(['MaxLikes', 'MinLikes', 'Newest', 'Oldest']).optional(),

  // paginação
  offset: z
    .number({ coerce: true })
    .int()
    .min(0)
    .nullish()
    .transform((val) => val ?? 0),
  limit: z
    .number({ coerce: true })
    .int()
    .min(1)
    .max(15)
    .nullish()
    .transform((val) => val ?? 15),
});