import type { Types } from 'mongoose';
import type { Atividade } from '../Atividade/Types';
import type { CorrecaoRedacaoIAResponse } from '../CorrecaoRedacaoIA/Types';

// Notificações Sobre tarefas
export type TarefaEnviadaEventPayload = {
  atividade: Atividade;
  remetentes: Types.ObjectId[];
};

export type TarefaFechadaEventPayload = {
  atividade: Atividade;
  remetentes: Types.ObjectId[];
};

export type TarefaCorrigidaEventPayload = {
  atividade: Atividade;
  remetentes: Types.ObjectId[];
};

// Correção de IA
export type RedacaoIACorrigidaEventPayload = {
  redacaoLivreId: string;
  correcao: CorrecaoRedacaoIAResponse;
  remetente: string;
};

export type RedacaoComAtrasoEventPayload = {
  redacaoLivreId: string;
  remetente: string;
};

export type AppEventMap = {
  'tarefa:enviada': TarefaEnviadaEventPayload;
  'tarefa:fechada': TarefaFechadaEventPayload;
  'tarefa:corrigida': TarefaCorrigidaEventPayload;
  'redacao:ia:corrigida': RedacaoIACorrigidaEventPayload;
  'redacao:ia:delay': RedacaoComAtrasoEventPayload;
};
