import z from 'zod';
import { comentarioResponse, perfilUsuarioResponse } from './Commom';

export const getObraResponse = z.object({
  id: z.string(),
  titulo: z.string(),
  sinopse: z.string(),
  autor: z.string().optional(),
  criador: perfilUsuarioResponse,
  totalLikes: z.number(),
  comentarios: comentarioResponse.array(),
  subtopicos: z.array(z.string()),
  topico: z.string(),
  tipoObra: z.enum(['livro', 'filme', 'música', 'teatro']),
  favoritadoPorUsuario: z.boolean(),
  likeDoUsuario: z.boolean(),
});

export const createObraBodyValidation = z.object({
  titulo: z.string({
    invalid_type_error: 'O campo titulo precisa ser um texto.',
    required_error: 'O campo titulo é obrigatório.',
  }),
  sinopse: z.string({
    invalid_type_error: 'O campo resumo precisa ser um texto.',
    required_error: 'O campo resumo é obrigatório.',
  }),
  autor: z.string({
    invalid_type_error: 'O campo autor precisa ser um texto.',
    required_error: 'O campo autor é obrigatório.',
  }),
  tipoObra: z.enum(['livro', 'filme', 'música', 'teatro']),
  subtopicos: z
    .array(
      z.string({
        invalid_type_error: 'O campo subtopicos precisa ser um texto.',
      }),
    )
    .min(1, 'O campo subtopicos precisa conter ao menos um subtópico.'),

  topico: z.string({
      invalid_type_error: 'O campo topico precisa ser um texto.',
      required_error: 'O campo topico é obrigatório.',
    }),
});

export const updateObraBodyValidation = z
  .object({
    titulo: z
      .string({
        invalid_type_error: 'O campo titulo precisa ser um texto.',
      })
      .nonempty('O campo titulo não pode estar vazio.')
      .optional(),
    sinopse: z
      .string({
        invalid_type_error: 'O campo resumo precisa ser um texto.',
      })
      .nonempty('O campo sinopse não pode estar vazio.')
      .optional(),
    autor: z
      .string({
        invalid_type_error: 'O campo autor precisa ser um texto.',
      })
      .nonempty('O campo autor não pode estar vazio.')
      .optional(),
    tipoObra: z
      .enum(['livro', 'filme', 'música', 'teatro'], {
        message: 'O campo tipo deve ser "livro", "filme", "música" ou "teatro".',
      })
      .optional(),
    subtopicos: z
      .array(
        z.string({
          invalid_type_error: 'O campo subtopicos precisa ser um texto.',
        }),
      )
      .min(1, 'O campo subtopicos precisa conter ao menos um subtópico.')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Forneça ao menos um campo para atualizar.',
  });
