import { z } from 'zod';

export const validateRequisicaoEmailBodyValidation = z.object({
  codigo: z
    .string({
      required_error: 'O campo codigo é obrigatório.',
      invalid_type_error: 'O campo codigo precisa ser um texto.',
    })
    .nonempty('O campo codigo não pode estar vazio'),
});

export const createRequisicaoEmailBodyValidation = z.object({
  email: z.string({
      required_error: 'O campo email é obrigatório.',
      invalid_type_error: 'O campo email precisa ser um texto.',
    })
    .nonempty('O campo email não pode estar vazio'),
})

export const createRequisicaoEmailResponse = z.object({
  id: z.string()
})

