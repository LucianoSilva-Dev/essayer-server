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

    return reply.status(204).send();
  },

  recentes: async (request, reply) => {
    const { id: professor } = request.user as RequestUserData;

    const response = await AtividadeService.recentes(professor);

    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send(response.data);
  },

  getAllAtividadesAluno: async (request, reply) => {
    const { id } = request.user as RequestUserData;

    const response = await AtividadeService.getAllAtividadesAluno(id);

    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send(response.data);
  },

  getCorrecaoRedacao: async (request, reply) => {
    const user = request.user as RequestUserData
    const { id, alunoId } = request.params as { id: string, alunoId: string };

    const response = await AtividadeService.getCorrecaoRedacao(
      id,
      alunoId,
      user
    );

    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send(response.data);
  },
};
