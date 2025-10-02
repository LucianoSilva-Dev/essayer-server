import { z } from "zod";

export const tiposAtividade = z.enum(['Redacao'])

export const AtividadesRecentesResponse = z.array(z.object({
    id: z.string(),
    titulo: z.string(),
    descricao: z.string(),
    respostas: z.number(),
    createdAt: z.date(),
    totalAlunos: z.number()
}))