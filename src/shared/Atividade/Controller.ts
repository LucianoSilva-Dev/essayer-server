import type { Controller, RequestUserData } from '../Types';
import { AtividadeService } from './Service';

export const AtividadeController: Controller = {
  delete: async (request, reply) => {
    const { id } = request.params as { id: string };
    const { id: requisitante } = request.user as RequestUserData;

    const response = await AtividadeService.delete(id, requisitante);

    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(204).send()
  },
};
