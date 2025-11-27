import { z } from "zod";
import { feedbackDoc } from "./Redacao/Validations";

export const tiposAtividade = z.enum(['Redacao'])

export const AtividadesRecentesResponse = z.array(z.object({
  id: z.string(),
  titulo: z.string(),
  descricao: z.string(),
  respostas: z.number(),
  createdAt: z.date(),
  totalAlunos: z.number()
}))

export const getAllAtividadesAlunoResponse = z.array(z.object({
  id: z.string(),
  titulo: z.string(),
  descricao: z.string(),
  dataLimite: z.date().nullable(),
  tipoAtividade: tiposAtividade,
  status: z.string(),
  turma: z.object({
    id: z.string(),
    nome: z.string(),
    iconeId: z.string()
  })
}))

export const getCorrecaoRedacao = z.object({
  id: z.string(),
  titulo: z.string(),
  tema: z.string(),
  texto: z.string().optional(),
  feedback: feedbackDoc.optional()
})