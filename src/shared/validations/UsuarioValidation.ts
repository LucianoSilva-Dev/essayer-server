import { z } from 'zod';

export const getUsuarioResponse = z.object({
  id: z.string(),
  nome: z.string(),
  cargo: z.enum(['aluno', 'professor', 'admin']),
});

export const createUsuarioBodyValidation = z.object({
  nome: z
    .string({
      required_error: 'O campo nome é obrigatório.',
      invalid_type_error: 'O campo nome precisa ser um texto.',
    })
    .nonempty('O campo nome não pode estar vazio.'),
  email: z
    .string({
      required_error: 'O campo email é obrigatório.',
      invalid_type_error: 'O campo email precisa ser um texto.',
    })
    .email('Email inválido')
    .nonempty('O campo email não pode estar vazio.'),
  senha: z
    .string({
      required_error: 'O campo senha é obrigatório.',
      invalid_type_error: 'O campo senha precisa ser um texto.',
    })
    .regex(
      /^(?=.*[a-z])(?=.*\d).{8,24}$/,
      'A senha deve ter de 8 a 24 caracteres, ao menos uma letra minúscula e um número.',
    )
    .nonempty('O campo senha não pode estar vazio.'),
});

export const updateUsuarioBodyValidation = z
  .object({
    nome: z
      .string({
        invalid_type_error: 'O campo nome precisa ser um texto.',
      })
      .nonempty('O campo nome não pode estar vazio.')
      .optional(),
    email: z
      .string({
        invalid_type_error: 'O campo email precisa ser um texto.',
      })
      .email('Email inválido')
      .nonempty('O campo email não pode estar vazio.')
      .optional(),
    senha: z
      .string({
        invalid_type_error: 'O campo senha precisa ser um texto.',
      })
      .regex(
        /^(?=.*[a-z])(?=.*\d).{8,24}$/,
        'A senha deve ter de 8 a 24 caracteres, ao menos uma letra minúscula e um número.',
      )
      .nonempty('O campo senha não pode estar vazio.')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Forneça ao menos um campo para atualizar.',
  });

export const professorCreateBodyValidation = z.object({
  lattes: z
    .string({
      required_error: 'O campo lattes é obrigatório.',
      invalid_type_error: 'O campo lattes precisa ser um texto.',
    })
    .nonempty('O campo lattes não pode estar vazio.'),
});
