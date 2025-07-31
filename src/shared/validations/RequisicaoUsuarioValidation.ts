import { z } from 'zod';

export const validateRequisicaoUsuarioBodyValidation = z.object({
  codigo: z
    .string({
      required_error: 'O campo codigo é obrigatório.',
      invalid_type_error: 'O campo codigo precisa ser um texto.',
    })
    .nonempty('O campo codigo não pode estar vazio'),
});

export const getRequisicaoUsuarioResponse = z.object({
  _id: z.string(),
  nome: z.string(),
  senha: z.string(),
  email: z.string(),
  codigo: z.string(),
})