import { z } from 'zod';

export const createRedacaoLivreBodyValidation = z.object({
  tema: z
    .string({
      required_error: 'O campo tema é obrigatório.',
      invalid_type_error: 'O campo tema precisa ser um texto.',
    })
    .nonempty('O campo tema não pode estar vazio.'),
});

export const getRedacaoLivreResponse = z.object({
  id: z.string(),
  tema: z.string(),
  texto: z.string().optional(),
  duracao: z.number().optional(),
  dataRealizacao: z.date().optional(),
  finalizada: z.boolean(),
  updatedAt: z.date(),
});

export const updateRedacaoLivreBodyValidation = z
  .object({
    texto: z
      .string({
        invalid_type_error: 'O campo texto precisa ser um texto.',
      })
      .nonempty()
      .optional(),
    duracao: z
      .number({
        invalid_type_error: 'O campo duracao precisa ser um número.',
      })
      .optional(),
    finalizada: z
      .boolean({
        invalid_type_error:
          'O campo finalizada precisa ser verdadeiro ou falso.',
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Forneça ao menos um campo para atualizar.',
  });
