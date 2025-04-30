import z from 'zod';

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
  tipo: z.enum(['livro', 'filme', 'música', 'teatro']),
  subtopicos: z
    .array(
      z.string({
        invalid_type_error: 'O campo subtopicos precisa ser um texto.',
      }),
    )
    .min(1, 'O campo subtopicos precisa conter ao menos um subtópico.'),
});

export const updateObraBodyValidation = z.object({
  titulo: z
    .string({
      invalid_type_error: 'O campo titulo precisa ser um texto.',
    })
    .optional(),
  sinopse: z
    .string({
      invalid_type_error: 'O campo resumo precisa ser um texto.',
    })
    .optional(),
  autor: z
    .string({
      invalid_type_error: 'O campo autor precisa ser um texto.',
    })
    .optional(),
  tipo: z.enum(['livro', 'filme', 'música', 'teatro']).optional(),
  subtopicos: z
    .array(
      z.string({
        invalid_type_error: 'O campo subtopicos precisa ser um texto.',
      }),
    )
    .min(1, 'O campo subtopicos precisa conter ao menos um subtópico.')
    .optional(),
});
