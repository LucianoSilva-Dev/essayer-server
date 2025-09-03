import type { Controller, RequestUserData } from '../../shared/Types';
import { NotificacaoService } from './Service';
import type { ChangeStatusNotificacaoBody } from './Types';

export const NotificacaoController: Controller = {
  getAll: async (request, reply) => {
    const { id: userId } = request.user as RequestUserData;
    const response = await NotificacaoService.getAll(userId);
    reply.status(200).send(response.data);
  },

  changeStatus: async (request, reply) => {
    const { id: userId } = request.user as RequestUserData;
    const { notificacaoIds } = request.body as ChangeStatusNotificacaoBody

    await NotificacaoService.changeStatus(userId, notificacaoIds);
    reply.status(204).send();
  },
};
