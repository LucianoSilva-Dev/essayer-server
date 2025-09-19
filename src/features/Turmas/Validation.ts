import { z } from 'zod';
import { perfilUsuarioResponse } from '../Repertorios/Validations/Commom';

// Validation for creating a new class
export const createTurmaBodyValidation = z.object({
  nome: z
    .string({ required_error: 'O campo nome é obrigatório.' })
    .nonempty('O campo nome não pode estar vazio'),
  escola: z
    .string({ invalid_type_error: 'O campo escola precisa ser um texto' })
    .nullish(),
});

// Validation for updating a class
export const updateTurmaBodyValidation = z
  .object({
    nome: z.string().nonempty('O campo nome não pode estar vazio').optional(),
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
  escola: z.string().nullable().default(null),
  criador: perfilUsuarioResponse,
  membros: z.array(perfilUsuarioResponse),
});

export const getTurmasResponse = z.array(
  z.object({
    id: z.string(),
    nome: z.string(),
    escola: z.string().nullable().default(null),
    criador: perfilUsuarioResponse,
  }),
);

export const getTurmasCriadasResponse = z.array(
  z.object({
    id: z.string(),
    nome: z.string(),
    escola: z.string().nullable().default(null),
  }),
);

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
    tipoAtividade: z.enum(['Redacao']),
    titulo: z.string(),
    descricao: z.string(),
    dataLimite: z.string().datetime().nullable()
  }),
);
