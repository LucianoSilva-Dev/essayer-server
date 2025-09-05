import { isValidObjectId } from 'mongoose';
import { z } from 'zod';

export const createRedacaoBodyValidation = z.object({
  titulo: z
    .string({
      required_error: 'O campo titulo é obrigatório.',
      invalid_type_error: 'O campo titulo precisa ser um texto.',
    })
    .nonempty('O campo titulo não pode estar vazio.'),
  descricao: z
    .string({
      required_error: 'O campo descricao é obrigatório.',
      invalid_type_error: 'O campo descricao precisa ser um texto.',
    })
    .nonempty(),
  turma: z
    .string({
      required_error: 'O campo turma é obrigatório.',
      invalid_type_error: 'O campo turma precisa ser um texto.',
    })
    .refine((val) => isValidObjectId(val), {
      message: 'O campo turma não é um ID válido.',
    }),
  tema: z
    .string({
      required_error: 'O campo tema é obrigatório.',
      invalid_type_error: 'O campo tema precisa ser um texto.',
    })
    .nonempty('O campo tema não pode estar vazio.'),
  dataLimite: z
    .string()
    .datetime({
      message: 'O campo dataLimite precisar ser uma data.',
    })
    .optional(),
  tempoLimiteEmMinutos: z
    .number({
      invalid_type_error: 'O campo tempoLimiteEmMinutos precisa ser um número.',
    })
    .optional(),
  repertoriosApoio: z
    .array(
      z
        .string({
          invalid_type_error: 'O campo repertoriosApoio só pode conter textos.',
        })
        .refine((val) => isValidObjectId(val), {
          message: 'O campo repertoriosApoio não é um ID válido.',
        }),
    )
    .optional(),
});

export const updateRedacaoBodyValidation = z
  .object({
    titulo: z
      .string({
        invalid_type_error: 'O campo titulo precisa ser um texto.',
      })
      .nonempty()
      .optional(),
    descricao: z
      .string({
        invalid_type_error: 'O campo descricao precisa ser um texto.',
      })
      .optional(),
    tema: z
      .string({
        invalid_type_error: 'O campo tema precisa ser um texto.',
      })
      .nonempty()
      .optional(),
    dataLimite: z
      .string()
      .datetime({
        message: 'O campo dataLimite precisar ser uma data.',
      })
      .optional(),
    tempoLimiteEmMinutos: z
      .number({
        invalid_type_error:
          'O campo tempoLimiteEmMinutos precisa ser um número.',
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Forneça ao menos um campo para atualizar.',
  });

export const getRedacaoResponse = z.object({
  titulo: z.string(),
  descricao: z.string(),
  dataLimite: z.date().nullable(),
  turma: z.object({
    id: z.string(),
    nome: z.string(),
  }),
  tema: z.string(),
  tempoLimiteEmMinutos: z.number().optional(),
  repertoriosApoio: z.array(z.object({ id: z.string() })).optional(),
  respostas: z
    .array(
      z.object({
        id: z.string(),
        texto: z.string().optional(),
        dataEnvio: z.date().optional(),
      }),
    )
    .optional(),
});

export const enviarRedacaoBodyValidation = z.object({
  texto: z
    .string({
      required_error: 'O campo texto é obrigatório.',
      invalid_type_error: 'O campo texto precisa ser um texto.',
    })
    .nonempty('O campo texto não pode estar vazio.'),
});

export const feedbackRedacaoBodyValidation = z.object({
  feedback: z
    .string({
      required_error: 'O campo feedback é obrigatório.',
      invalid_type_error: 'O campo feedback precisa ser um texto.',
    })
    .nonempty('O campo feedback não pode estar vazio.'),
});
