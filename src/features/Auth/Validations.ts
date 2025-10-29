import z from 'zod';
import { perfilUsuarioResponse } from '../../shared/Validations';

export const userLoginBodyValidation = z.object({
  email: z
    .string({
      required_error: 'O campo email é obrigatório.',
      invalid_type_error: 'O campo email precisa ser um texto.',
    })
    .email('Email inválido.'),
  senha: z.string({
    required_error: 'O campo senha é obrigatório.',
    invalid_type_error: 'O campo senha precisa ser um texto.',
  }),
});

export const userLoginResponseValidation = z.object({
  ...perfilUsuarioResponse.shape,
  email: z.string().email(),
  cargo: z.string(),
});
