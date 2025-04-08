import z from 'zod';
import { isValidObjectId } from 'mongoose';

export const createBackgroundBodyValidation = z.object({
  content: z.string({
    invalid_type_error: 'O campo conteúdo precisa ser um texto.',
  }),
  author: z.string({
    invalid_type_error: 'O campo autor precisa ser um texto.',
  }),
  creator: z
    .string({
      invalid_type_error: 'O campo criador precisa ser um texto.',
    })
    .refine(
      (value) => isValidObjectId(value),
      'O campo criador não é um id válido.',
    ),
});
