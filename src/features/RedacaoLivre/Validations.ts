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
  duracao: z.number({
    invalid_type_error: 'O campo duracao precisa ser um número.',
  }).optional(),
});

const getCorrecaoRedacaoFinalizadaResponse = z.object({
  id: z.string(),
  texto: z.string(),
  status: z.literal(EnumCorrecaoRedacaoStatus.Finalizada),
  ...correcaoRedacaoAIValidation.shape, // Inclui notaC1, feedbackC1, etc.
  createdAt: z.date(),
});

const getCorrecaoRedacaoPendenteOuErroResponse = z.object({
  id: z.string(),
  status: z.enum([
    EnumCorrecaoRedacaoStatus.Pendente,
    EnumCorrecaoRedacaoStatus.Erro,
  ]),
  createdAt: z.date(),
});

// Junta os schemas usando um "discriminador" (o campo 'status')
// Isso cria um tipo forte e uma validação que entende a diferença entre os objetos.
export const getCorrecaoRedacaoResponse = z.discriminatedUnion('status', [
  getCorrecaoRedacaoFinalizadaResponse,
  getCorrecaoRedacaoPendenteOuErroResponse,
]);


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