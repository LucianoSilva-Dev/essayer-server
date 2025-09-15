import { AppEventEmitter } from '../../shared/Events/Emitter';
import type {
  TarefaCorrigidaEventPayload,
  TarefaEnviadaEventPayload,
  TarefaFechadaEventPayload,
} from '../../shared/Events/Types';
import type { Controller, RequestUserData } from '../../shared/Types';
import {
  createNotificacaoTarefaCorrigidaListener,
  createNotificacaoTarefaEnviadaListener,
  createNotificacaoTarefaFechadaListener,
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
    const tarefaEnviadaListenerWrapper = (payload: TarefaEnviadaEventPayload) =>
      streamNotificacaoTarefaEnviadaListener(payload, reply);

    const tarefaFechadaListenerWrapper = (payload: TarefaFechadaEventPayload) =>
      streamNotificacaoTarefaFechadaListener(payload, reply);

    const tarefaCorrigidaListenerWrapper = (
      payload: TarefaCorrigidaEventPayload,
    ) => streamNotificacaoTarefaCorrigidaListener(payload, reply);

    AppEventEmitter.on('tarefa:enviada', tarefaEnviadaListenerWrapper);
    AppEventEmitter.on('tarefa:fechada', tarefaFechadaListenerWrapper);
    AppEventEmitter.on('tarefa:corrigida', tarefaCorrigidaListenerWrapper);

    request.raw.once('close', () => {
      AppEventEmitter.off('tarefa:enviada', tarefaEnviadaListenerWrapper);
      AppEventEmitter.off('tarefa:fechada', tarefaFechadaListenerWrapper);
      AppEventEmitter.off('tarefa:corrigida', tarefaCorrigidaListenerWrapper);
    });
  },
};
