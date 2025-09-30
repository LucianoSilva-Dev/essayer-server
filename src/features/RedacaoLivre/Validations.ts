import { z } from 'zod';
import { correcaoRedacaoAIValidation } from '../../shared/CorrecaoRedacaoIA/Validations';
import { EnumCorrecaoRedacaoStatus } from '../../shared/CorrecaoRedacaoIA/Types';

export const createRedacaoLivreBodyValidation = z.object({
  tema: z
    .string({
      required_error: 'O campo tema é obrigatório.',
      invalid_type_error: 'O campo tema precisa ser um texto.',
    })
    .nonempty('O campo tema não pode estar vazio.'),
});

export const getCorrecaoRedacaoResponse = z.object({
  ...correcaoRedacaoAIValidation.shape,
  id: z.string(),
  createdAt: z.date(),
  status: z.nativeEnum(EnumCorrecaoRedacaoStatus),
});

export const getRedacaoLivreResponse = z.object({
  id: z.string(),
  tema: z.string(),
  texto: z.string().optional(),
  duracao: z.number().optional(),
  correcoesIA: z.array(getCorrecaoRedacaoResponse).optional(),
  updatedAt: z.date(),
});

export const getAllRedacaoLivreResponse = z.object({
  id: z.string(),
  tema: z.string(),
  texto: z.string().optional(),
  duracao: z.number().optional(),
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
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Forneça ao menos um campo para atualizar.',
  });

export const corrigirRedacaoBodyValidation = z.object({
  tema: z
    .string({
      required_error: 'O campo tema é obrigatório.',
      invalid_type_error: 'O campo tema precisa ser um texto.',
    })
    .nonempty('O campo tema não pode estar vazio.'),
  textoRedacao: z
    .string({
      required_error: 'O campo textoRedacao é obrigatório.',
      invalid_type_error: 'O campo textoRedacao precisa ser um texto.',
    })
    .nonempty('O campo tema não pode estar vazio.'),
});
