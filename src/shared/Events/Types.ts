import type { GetCorrecaoRedacaoResponse } from '../../features/RedacaoLivre/Types';
import type { Atividade } from '../Atividade/Types';
import type { CorrecaoRedacaoAIValidation } from '../CorrecaoRedacaoIA/Types';
import type {
  NotificacaoRequisicaoProfessorStatus,
  NotificacaoTarefaCorrigida,
  NotificacaoTarefaEnviada,
  NotificacaoTarefaFechada,
} from '../../features/Notificacoes/Types';

// Notificações Sobre tarefas
export type TarefaEnviadaEventPayload = {
  atividade: Atividade;
  remetentes: string[];
};

export type TarefaFechadaEventPayload = {
  atividade: Atividade;
  remetentes: string[];
};

export type TarefaCorrigidaEventPayload = {
  atividade: Atividade;
  remetentes: string[];
};

export type RequisicaoProfessorStatusEventPayload = {
  requisicaoId: string;
  remetente: string;
  motivo?: string;
  aprovado: boolean;
}

// Correção de IA
export type RedacaoIACorrigidaEventPayload = {
  redacaoLivreId: string;
  correcaoId: string;
  correcao: CorrecaoRedacaoAIValidation;
  remetente: string;
};

export type RedacaoIAPersistidaEventPayload = {
  redacaoLivreId: string;
  correcao: GetCorrecaoRedacaoResponse;
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
  'redacao:ia:persistida': RedacaoIAPersistidaEventPayload;
  'redacao:ia:delay': RedacaoComAtrasoEventPayload;
  'requisicao-professor:status': RequisicaoProfessorStatusEventPayload;
  'notificacao:tarefa:enviada:criada': NotificacaoTarefaEnviada;
  'notificacao:tarefa:fechada:criada': NotificacaoTarefaFechada;
  'notificacao:tarefa:corrigida:criada': NotificacaoTarefaCorrigida;
  'notificacao:requisicao-professor:status:criada': NotificacaoRequisicaoProfessorStatus;
};
