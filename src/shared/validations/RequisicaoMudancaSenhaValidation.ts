import { z } from 'zod';

export const createRequisicaoMudancaSenhaResponse = z.object({
  id: z.string(),
});

export const validateRequisicaoMudancaSenhaBodyValidation = z.object({
  codigo: z
    .string({
      required_error: 'O campo codigo é obrigatório.',
      invalid_type_error: 'O campo codigo precisa ser um texto.',
    })
    .nonempty('O campo codigo não pode estar vazio'),
});

export const getRequisicaoMudancaSenhaResponse = z.object({
  _id: z.string(),
  requisitante: z.string().nullable(),
  codigo: z.string()
})
