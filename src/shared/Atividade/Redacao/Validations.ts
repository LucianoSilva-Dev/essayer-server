import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { perfilUsuarioResponse } from '../../Validations';

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
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Forneça ao menos um campo para atualizar.',
  });

export const feedbackDoc = z.object({
  notaC1: z.number(),
  notaC2: z.number(),
  notaC3: z.number(),
  notaC4: z.number(),
  notaC5: z.number(),
  feedbackC1: z.string(),
  feedbackC2: z.string(),
  feedbackC3: z.string(),
  feedbackC4: z.string(),
  feedbackC5: z.string(),
})

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
  repertoriosApoio: z.array(z.string()).optional(),
  respostas: z
    .array(
      z.object({
        id: z.string(),
        aluno: z.string(),
        texto: z.string().optional(),
        dataEnvio: z.date().optional(),
        feedback: feedbackDoc.optional(),
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
  notaC1: z.number({
      invalid_type_error: 'O campo notaC1 precisa ser um número.',
      required_error: "O campo notaC1 é obrigatório."
    }),
  notaC2: z.number({
      invalid_type_error: 'O campo notaC2 precisa ser um número.',
      required_error: "O campo notaC2 é obrigatório."
    }),
  notaC3: z.number({
      invalid_type_error: 'O campo notaC3 precisa ser um número.',
      required_error: "O campo notaC3 é obrigatório."
    }),
  notaC4: z.number({
      invalid_type_error: 'O campo notaC4 precisa ser um número.',
      required_error: "O campo notaC4 é obrigatório."
    }),
  notaC5: z.number({
      invalid_type_error: 'O campo notaC5 precisa ser um número.',
      required_error: "O campo notaC5 é obrigatório."
    }),
  feedbackC1: z
    .string({
      required_error: 'O campo feedbackC1 é obrigatório.',
      invalid_type_error: 'O campo feedbackC1 precisa ser um texto.',
    })
    .nonempty('O campo feedbackC1 não pode estar vazio.'),
  feedbackC2: z
    .string({
      required_error: 'O campo feedbackC2 é obrigatório.',
      invalid_type_error: 'O campo feedbackC2 precisa ser um texto.',
    })
    .nonempty('O campo feedbackC2 não pode estar vazio.'),
  feedbackC3: z
    .string({
      required_error: 'O campo feedbackC3 é obrigatório.',
      invalid_type_error: 'O campo feedbackC3 precisa ser um texto.',
    })
    .nonempty('O campo feedbackC3 não pode estar vazio.'),
  feedbackC4: z
    .string({
      required_error: 'O campo feedbackC4 é obrigatório.',
      invalid_type_error: 'O campo feedbackC4 precisa ser um texto.',
    })
    .nonempty('O campo feedbackC4 não pode estar vazio.'),
  feedbackC5: z
    .string({
      required_error: 'O campo feedbackC5 é obrigatório.',
      invalid_type_error: 'O campo feedbackC5 precisa ser um texto.',
    })
    .nonempty('O campo feedbackC5 não pode estar vazio.'),
});

export const getAllRespostasRedacaoQueryValidation = z.object({
  offset: z
    .number({ coerce: true })
    .int()
    .min(0)
    .nullish()
    .transform((val) => val ?? 0),
  limit: z
    .number({ coerce: true })
    .int()
    .min(1)
    .max(15)
    .nullish()
    .transform((val) => val ?? 15),
});

export const getAllRespostasRedacaoResponse = z.object({
  documentos: z.array(
    z.object({
      id: z.string(),
      texto: z.string().optional(),
      dataEnvio: z.date(),
      feedback: feedbackDoc.optional(),
      aluno: perfilUsuarioResponse,
      tempoEmMinutos: z.number(),
    }),
  ),
  paginacao: z.object({
    offset: z.coerce.number().int().min(0),
    limit: z.coerce.number().int().min(1).max(15),
    nextPageUrl: z.string().nullable(),
    previousPageUrl: z.string().nullable(),
    totalDocuments: z.number().int(),
    pagesUrl: z.array(z.string())
  }),
});
