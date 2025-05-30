import { z } from 'zod';
import { perfilUsuarioResponse } from '../../features/Repertorios/Validations/Commom';

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

export const mudarSenhaBodyValidation = z.object({
  senhaAntiga: z.string({
    required_error: 'O campo novaSenha é obrigatório.',
    invalid_type_error: 'O campo novaSenha precisa ser um texto.',
  }),
  novaSenha: z
    .string({
      required_error: 'O campo novaSenha é obrigatório.',
      invalid_type_error: 'O campo novaSenha precisa ser um texto.',
    })
    .regex(
      /^(?=.*[a-z])(?=.*\d).{8,24}$/,
      'A senha deve ter de 8 a 24 caracteres, ao menos uma letra minúscula e um número.',
    )
    .nonempty('O campo senha não pode estar vazio.'),
});

export const getRequisicaoMudancaSenhaResponse = z.object({
  _id: z.string(),
  requisitante: z.string().nullable(),
  codigo: z.string()
})
