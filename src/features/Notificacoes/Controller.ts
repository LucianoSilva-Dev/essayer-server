import type { Controller, RequestUserData } from '../../shared/Types';
import { NotificacaoService } from './Service';

export const NotificacaoController: Controller = {
  getAll: async (request, reply) => {
    const { id: userId } = request.user as RequestUserData;
    const response = await NotificacaoService.getAll(userId);
    reply.status(200).send(response.data);
  },
};
