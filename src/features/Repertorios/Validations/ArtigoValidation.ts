import z from 'zod';
import { comentarioResponse, perfilUsuarioResponse } from './Commom';

export const getArtigoResponse = z.object({
  id: z.string(),
  titulo: z.string(),
  resumo: z.string(),
  autor: z.string(),
  fonte: z.string(),
  criador: perfilUsuarioResponse,
  totalLikes: z.number(),
  comentarios: comentarioResponse.array(),
  totalComentarios: z.number(),
  subtopicos: z.array(z.string()),
  topicos: z.array(z.string()),
  favoritadoPeloUsuario: z.boolean(),
  likeDoUsuario: z.boolean(),
});

export const createArtigoBodyValidation = z.object({
  titulo: z.string({
    invalid_type_error: 'O campo titulo precisa ser um texto.',
    required_error: 'O campo titulo é obrigatório.',
  }),
  resumo: z.string({
    invalid_type_error: 'O campo resumo precisa ser um texto.',
    required_error: 'O campo resumo é obrigatório.',
  }),
  autor: z.string({
    invalid_type_error: 'O campo autor precisa ser um texto.',
    required_error: 'O campo autor é obrigatório.',
  }),
  fonte: z.string({
    invalid_type_error: 'O campo fonte precisa ser um texto.',
    required_error: 'O campo fonte é obrigatório.',
  }),
  subtopicos: z
    .array(
      z.string({
        invalid_type_error: 'O campo subtopicos precisa ser um texto.',
      }),
    )
    .min(1, 'O campo subtopicos precisa conter ao menos um subtópico.'),

  topicos: z
    .array(
      z.string({
        invalid_type_error: 'O campo topicos precisa ser um texto.',
      }),
    )
    .min(1, 'O campo topicos precisa conter ao menos um tópico.'),
});

export const updateArtigoBodyValidation = z
  .object({
    titulo: z
      .string({
        invalid_type_error: 'O campo titulo precisa ser um texto.',
      })
      .nonempty('O campo titulo não pode estar vazio.')
      .optional(),
    resumo: z
      .string({
        invalid_type_error: 'O campo resumo precisa ser um texto.',
      })
      .nonempty('O campo resumo não pode estar vazio.')
      .optional(),
    autor: z
      .string({
        invalid_type_error: 'O campo autor precisa ser um texto.',
      })
      .nonempty('O campo autor não pode estar vazio.')
      .optional(),
    fonte: z
      .string({
        invalid_type_error: 'O campo fonte precisa ser um texto.',
      })
      .nonempty('O campo fonte não pode estar vazio.')
      .optional(),
    subtopicos: z
      .array(
        z.string({
          invalid_type_error: 'Os subtopicos precisam ser um texto.',
        }),
      )
      .min(1, 'O campo subtopicos precisa conter ao menos um subtópico.')
      .optional(),
    topicos: z
      .array(
        z.string({
          invalid_type_error: 'O campo topicos precisa ser um texto.',
        }),
      )
      .min(1, 'O campo topicos precisa conter ao menos um subtópico.')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Forneça ao menos um campo para atualizar.',
  });