import { z } from "zod";
import { TiposNotificacao } from "./Types";


export const getAllNotificacaoTarefaEnviadaDoc = z.object({
    tipoNotificacao: z.literal(TiposNotificacao.TarefaEnviada),
    tarefaId: z.string(),
})

export const getAllNotificacaoTarefaFechadaDoc = z.object({
    tipoNotificacao: z.literal(TiposNotificacao.TarefaFechada),
    tarefaId: z.string(),
})

export const getAllNotificacaoTarefaCorrigidaDoc = z.object({
    tipoNotificacao: z.literal(TiposNotificacao.TarefaCorrigida),
    tarefaId: z.string(),
})

export const getAllNotificacaoResponse = z.array(
    z.discriminatedUnion('tipoNotificacao', [
        getAllNotificacaoTarefaEnviadaDoc,
        getAllNotificacaoTarefaFechadaDoc,
        getAllNotificacaoTarefaCorrigidaDoc
    ]).optional()
)