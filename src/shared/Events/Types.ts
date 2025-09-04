import type { Types } from "mongoose"
import type { Atividade } from "../Atividade/Types"

export type TarefaEnviadaEventPayload = {
    atividade: Atividade
    remetentes: Types.ObjectId[]
}

export type TarefaFechadaEventPayload = {
    atividade: Atividade
    remetentes: Types.ObjectId[]
}

export type TarefaCorrigidaEventPayload = {
    atividade: Atividade
    remetentes: Types.ObjectId[]
}

export type AppEventMap = {
    'tarefa:enviada': TarefaEnviadaEventPayload,
    'tarefa:fechada': TarefaFechadaEventPayload,
    'tarefa:corrigida': TarefaCorrigidaEventPayload,
}