import z from 'zod';
import { comentarioResponse, perfilUsuarioResponse } from './Commom';

export const getCitacaoResponse = z.object({
  id: z.string(),
  frase: z.string(),
  autor: z.string(),
  fonte: z.string().optional(),
  criador: perfilUsuarioResponse,
  totalLikes: z.number(),
  comentarios: comentarioResponse.array(),
  totalComentarios: z.number(),
  subtopicos: z.array(z.string()),
  topicos: z.array(z.string()),
  favoritadoPeloUsuario: z.boolean(),
  likeDoUsuario: z.boolean(),
});

export const createCitacaoBodyValidation = z.object({
  frase: z.string({
    invalid_type_error: 'O campo frase precisa ser um texto.',
    required_error: 'O campo frase é obrigatório.',
  }),
  autor: z.string({
    invalid_type_error: 'O campo autor precisa ser um texto.',
    required_error: 'O campo autor é obrigatório.',
  }),
  subtopicos: z
    .array(
      z.string({
        invalid_type_error: 'Os subtopicos precisam ser um texto.',
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
  fonte: z
    .string({
      invalid_type_error: 'O campo fonte precisa ser um texto.',
    })
    .optional(),
});

export const updateCitacaoBodyValidation = z
  .object({
    frase: z
      .string({
        invalid_type_error: 'O campo frase precisa ser um texto.',
      })
      .nonempty('O campo frase não pode estar vazio.')
      .optional(),
    autor: z
      .string({
        invalid_type_error: 'O campo autor precisa ser um texto.',
      })
      .nonempty('O campo titulo não pode estar vazio.')
      .optional(),
    fonte: z
      .string({
        invalid_type_error: 'O campo fonte precisa ser um texto.',
      })
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