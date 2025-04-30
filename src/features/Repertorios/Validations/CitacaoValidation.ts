import z from 'zod';

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
  fonte: z
    .string({
      invalid_type_error: 'O campo fonte precisa ser um texto.',
    })
    .optional(),
});

export const updateCitacaoBodyValidation = z.object({
  frase: z
    .string({
      invalid_type_error: 'O campo frase precisa ser um texto.',
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
    .min(1, 'O campo subtopicos precisa conter ao menos um subtópico.')
    .optional(),
});
