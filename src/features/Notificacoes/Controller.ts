import { AppEventEmitter } from '../../shared/Events/Emitter';
import type {
  NotificacaoRequisicaoProfessorStatus,
  NotificacaoTarefaCorrigida,
  NotificacaoTarefaEnviada,
  NotificacaoTarefaFechada,
} from './Types';
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

    const tarefaEnviadaListenerWrapper = (payload: NotificacaoTarefaEnviada) =>
      streamNotificacaoTarefaEnviadaListener(payload, userId, reply);

    const tarefaFechadaListenerWrapper = (payload: NotificacaoTarefaFechada) =>
      streamNotificacaoTarefaFechadaListener(payload, userId, reply);

    const tarefaCorrigidaListenerWrapper = (
      payload: NotificacaoTarefaCorrigida
    ) => streamNotificacaoTarefaCorrigidaListener(payload, userId, reply);

    const requisicaoProfessorStatusListenerWrapper = (
      payload: NotificacaoRequisicaoProfessorStatus
    ) => streamNotificacaoRequisicaoProfessorStatusListener(payload, userId, reply);

    AppEventEmitter.on('notificacao:tarefa:enviada:criada', tarefaEnviadaListenerWrapper);
    AppEventEmitter.on('notificacao:tarefa:fechada:criada', tarefaFechadaListenerWrapper);
    AppEventEmitter.on('notificacao:tarefa:corrigida:criada', tarefaCorrigidaListenerWrapper);
    AppEventEmitter.on('notificacao:requisicao-professor:status:criada', requisicaoProfessorStatusListenerWrapper);

    request.raw.once('close', () => {
      AppEventEmitter.off('notificacao:tarefa:enviada:criada', tarefaEnviadaListenerWrapper);
      AppEventEmitter.off('notificacao:tarefa:fechada:criada', tarefaFechadaListenerWrapper);
      AppEventEmitter.off('notificacao:tarefa:corrigida:criada', tarefaCorrigidaListenerWrapper);
      AppEventEmitter.off('notificacao:requisicao-professor:status:criada', requisicaoProfessorStatusListenerWrapper);
      reply.sseContext.source.end()
    });
  },
};
