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
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,24}$/,
      'O campo senha precisa ter entre 8 e 24 caracteres, pelo menos uma letra maiúscula, uma letra minúscula e um número.',
    ),
});
