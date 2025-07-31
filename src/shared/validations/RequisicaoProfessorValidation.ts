import { z } from 'zod';

export const getRequisicaoProfessorResponse = z.object({
  id: z.string(),
  lattes: z.string(),
  requisitante: z.object({
    nome: z.string(),
    email: z.string(),
    id: z.string(),
  }).nullable(),
  revisor: z.object({
    nome: z.string(),
  }).optional().nullable(),
  status: z.string().optional(),
  createdAt: z.date()
});

export const updateStatusBodyValidation = z.object({
  status: z.enum(['aprovado', 'recusado'], {
    required_error: 'O campo status é obrigatório.',
    invalid_type_error:
      "O campo status precisa ter os valores 'aprovado' ou 'recusado'.",
  }),
  motivo: z.string({
    invalid_type_error: "O campo motivo precisa ser um texto."
  })
  .nonempty("O campo motivo não pode estar vazio.")
  .optional()
});
