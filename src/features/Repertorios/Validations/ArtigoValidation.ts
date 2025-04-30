import z from 'zod';

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
});

export const updateArtigoBodyValidation = z.object({
  titulo: z
    .string({
      invalid_type_error: 'O campo titulo precisa ser um texto.',
    })
    .optional(),
  resumo: z
    .string({
      invalid_type_error: 'O campo resumo precisa ser um texto.',
    })
    .optional(),
  autor: z
    .string({
      invalid_type_error: 'O campo autor precisa ser um texto.',
    })
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
    .min(1, 'O campo subtopicos precisa conter ao menos um subtópico.'),
});
