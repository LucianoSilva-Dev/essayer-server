import { AppEventEmitter } from '../../shared/Events/Emitter';
import type {
  RequisicaoProfessorStatusEventPayload,
  TarefaCorrigidaEventPayload,
  TarefaEnviadaEventPayload,
  TarefaFechadaEventPayload,
} from '../../shared/Events/Types';
import type { Controller, RequestUserData } from '../../shared/Types';
import {
  createNotificacaoRequisicaoProfessorStatusListener,
  createNotificacaoTarefaCorrigidaListener,
  createNotificacaoTarefaEnviadaListener,
  createNotificacaoTarefaFechadaListener,
  streamNotificacaoRequisicaoProfessorStatusListener,
  streamNotificacaoTarefaCorrigidaListener,
  streamNotificacaoTarefaEnviadaListener,
  streamNotificacaoTarefaFechadaListener,
} from './EventListeners';
import { NotificacaoService } from './Service';
import type { ChangeStatusNotificacaoBody } from './Types';

// Registra os EventListeners necessários assim que o arquivo for carregado
AppEventEmitter.on('tarefa:enviada', createNotificacaoTarefaEnviadaListener);
AppEventEmitter.on('tarefa:fechada', createNotificacaoTarefaFechadaListener);
AppEventEmitter.on(
  'tarefa:corrigida',
  createNotificacaoTarefaCorrigidaListener,
);
AppEventEmitter.on('requisicao-professor:status', createNotificacaoRequisicaoProfessorStatusListener)

export const NotificacaoController: Controller = {
  getAll: async (request, reply) => {
    const { id: userId } = request.user as RequestUserData;
    const response = await NotificacaoService.getAll(userId);
    reply.status(200).send(response.data);
  },

  changeStatus: async (request, reply) => {
    const { id: userId } = request.user as RequestUserData;
    const { notificacaoIds } = request.body as ChangeStatusNotificacaoBody;

    await NotificacaoService.changeStatus(userId, notificacaoIds);
    reply.status(204).send();
  },

  listen: async (request, reply) => {
    const { id: userId } = request.user as RequestUserData
    reply.sse({ comment: '' }) // evita fechar a conexão automaticamente

    const tarefaEnviadaListenerWrapper = (payload: TarefaEnviadaEventPayload) =>
      streamNotificacaoTarefaEnviadaListener(payload, userId, reply);

    const tarefaFechadaListenerWrapper = (payload: TarefaFechadaEventPayload) =>
      streamNotificacaoTarefaFechadaListener(payload, userId, reply);

    const tarefaCorrigidaListenerWrapper = (
      payload: TarefaCorrigidaEventPayload
    ) => streamNotificacaoTarefaCorrigidaListener(payload, userId, reply);

    const requisicaoProfessorStatusListenerWrapper = (
      payload: RequisicaoProfessorStatusEventPayload
    ) => streamNotificacaoRequisicaoProfessorStatusListener(payload, userId, reply);

    AppEventEmitter.on('tarefa:enviada', tarefaEnviadaListenerWrapper);
    AppEventEmitter.on('tarefa:fechada', tarefaFechadaListenerWrapper);
    AppEventEmitter.on('tarefa:corrigida', tarefaCorrigidaListenerWrapper);
    AppEventEmitter.on('requisicao-professor:status', requisicaoProfessorStatusListenerWrapper);

    request.raw.once('close', () => {
      AppEventEmitter.off('tarefa:enviada', tarefaEnviadaListenerWrapper);
      AppEventEmitter.off('tarefa:fechada', tarefaFechadaListenerWrapper);
      AppEventEmitter.off('tarefa:corrigida', tarefaCorrigidaListenerWrapper);
      AppEventEmitter.off('requisicao-professor:status', requisicaoProfessorStatusListenerWrapper);
      reply.sseContext.source.end()
    });
  },
};
