import { z } from 'zod';
import { feedbackDoc } from '../../shared/Atividade/Redacao/Validations';
import { tiposAtividade } from '../../shared/Atividade/Validations';
import { perfilUsuarioResponse } from '../../shared/Validations';

// Validation for creating a new class
export const createTurmaBodyValidation = z.object({
  nome: z
    .string({ required_error: 'O campo nome é obrigatório.' })
    .nonempty('O campo nome não pode estar vazio'),
  iconeId: z
    .string({ required_error: 'O campo iconeId é obrigatório.' })
    .nonempty('O campo iconeId não pode estar vazio'),
  escola: z
    .string({ invalid_type_error: 'O campo escola precisa ser um texto' })
    .nullish(),
});

// Validation for updating a class
export const updateTurmaBodyValidation = z
  .object({
    nome: z.string().nonempty('O campo nome não pode estar vazio').optional(),
    iconeId: z.string().nonempty('O campo iconeId não pode estar vazio').optional(),
    escola: z
      .string()
      .nonempty('O campo escola não pode estar vazio')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Forneça ao menos um campo para atualizar.',
  });

export const solicitarEntradaBodyValidation = z.object({
  codigoConvite: z
    .string({ required_error: 'O código de convite é obrigatório.' })
    .nonempty('O código de convite não pode estar vazio'),
});

// Schemas for responses
export const getTurmaResponse = z.object({
  id: z.string(),
  nome: z.string(),
  iconeId: z.string(),
  escola: z.string().nullable().default(null),
  criador: perfilUsuarioResponse,
  membros: z.array(perfilUsuarioResponse),
  totalMembros: z.number()
});

export const getTurmasResponse = z.object({
  documentos: z.array(
    z.object({
      id: z.string(),
      nome: z.string(),
      iconeId: z.string(),
      escola: z.string().nullable().default(null),
      criador: perfilUsuarioResponse,
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

export const getTurmasCriadasResponse = z.object({
  documentos: z.array(
    z.object({
      id: z.string(),
      nome: z.string(),
      iconeId: z.string(),
      escola: z.string().nullable().default(null),
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

export const getCodigoConviteResponse = z.object({
  codigoConvite: z.string(),
});

export const getAlunosResponse = z.array(perfilUsuarioResponse);

export const getAlunosPendentesResponse = z.array(perfilUsuarioResponse);

export const regenerarCodigoResponse = z.object({
  codigo: z.string(),
});

export const getAtividadesResponse = z.array(
  z.object({
    id: z.string(),
    tipoAtividade: tiposAtividade,
    titulo: z.string(),
    descricao: z.string(),
    dataLimite: z.date().nullable(),
    status: z.string()
  }),
);

export const getAtividadesCriadorResponse = z.array(
  z.object({
    id: z.string(),
    tipoAtividade: tiposAtividade,
    titulo: z.string(),
    descricao: z.string(),
    dataLimite: z.date().nullable(),
    usuariosResponderam: z.array(perfilUsuarioResponse),
    totalMembros: z.number()
  }),
);

export const getAllTurmaQueryValidation = z.object({
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

export const getAllAtividadesQueryValidation = z.object({
  titulo: z
    .string({
      invalid_type_error: 'O campo titulo precisa ser um texto',
    })
    .nonempty('O campo titulo não pode estar vazio')
    .optional(),
});

export const getAllFeedbacksResponse = z.array(z.object({
  id: z.string(),
  feedback: feedbackDoc,
  visto: z.boolean(),
  data: z.date(),
  atividade: z.object({
    id: z.string(),
    titulo: z.string(),
    tipoAtividade: tiposAtividade,
  })
}))

