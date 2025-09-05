import type { Types } from "mongoose"
import type { Atividade, TiposAtividade } from "../Atividade/Types"

export type TarefaEnviadaEventPayload = {
    tipoAtividade: TiposAtividade
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