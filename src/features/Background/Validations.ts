import z from 'zod';

export const createBackgroundBodyValidation = z.object({
  content: z.string({
    invalid_type_error: 'O campo conteúdo precisa ser um texto.',
  }),
  author: z.string({
    invalid_type_error: 'O campo autor precisa ser um texto.',
  }),
});
