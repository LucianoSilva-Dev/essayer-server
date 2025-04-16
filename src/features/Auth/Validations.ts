import z from 'zod';

export const userLoginBodyValidation = z.object({
  email: z
    .string({
      required_error: 'O campo email é obrigatório.',
      invalid_type_error: 'O campo email precisa ser um texto.',
    })
    .email('Email inválido.'),
  password: z.string({
    required_error: 'O campo senha é obrigatório.',
    invalid_type_error: 'O campo senha precisa ser um texto.',
  }),
});

export const userRegisterBodyValidation = z.object({
  name: z
    .string({
      required_error: 'O campo nome é obrigatório.',
      invalid_type_error: 'O campo nome precisa ser um texto.',
    })
    .nonempty('O campo nome é obrigatório.'),
  email: z
    .string({
      required_error: 'O campo email é obrigatório.',
      invalid_type_error: 'O campo email precisa ser um texto.',
    })
    .email('Email inválido.')
    .nonempty('O campo email é obrigatório.'),
  password: z
    .string({
      required_error: 'O campo senha é obrigatório.',
      invalid_type_error: 'O campo senha precisa ser um texto.',
    })
    .regex(
      /^(?=.*[a-z])(?=.*\d).{8,24}$/,
      'A senha deve ter de 8 a 24 caracteres, ao menos uma letra minúscula e um número.',
    ),
});
