import z from 'zod';

export const createBackgroundBodyValidation = z.object({
  content: z.string({
    invalid_type_error: 'O campo conteúdo precisa ser um texto.',
    required_error: 'O campo conteúdo é obrigatório.',
  }),
  font: z.string({
    invalid_type_error: 'O campo fonte precisa ser um texto.',
    required_error: 'O campo fonte é obrigatório.',
  }),
  author: z.string({
    invalid_type_error: 'O campo autor precisa ser um texto.',
    required_error: 'O campo autor é obrigatório.',
  }),
});
