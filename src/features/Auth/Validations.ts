import z from 'zod';

export const getTokenAuthBodyValidation = z.object({
  email: z
    .string({ message: 'o campo email precisa ser uma string.' })
    .email('email inválido'),
  password: z.string({ message: 'o campo senha precisa ser uma string.' }),
});

export const postRegisterAuthBodyValidation = z.object({
  name: z.string({ message: 'o campo nome precisa ser uma string.' }),
  email: z
    .string({ message: 'o campo email precisa ser uma string.' })
    .email('email inválido'),
  password: z
    .string({ message: 'o campo senha precisa ser uma string.' })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,24}$/,
      'o campo senha precisa ter entre 8 e 24 caracteres, pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.',
    ),
});
