import { RequisicaoProfessorService } from '../services/RequisicaoProfessorService';
import type { Controller, updateStatusBody } from '../Types';

export const RequisicaoProfessorController: Controller = {
  getAll: async (request, reply) => {
    const response = await RequisicaoProfessorService.getAll();
    return reply.status(200).send(response);
  },

  get: async (request, reply) => {
    const { id } = request.params as { id: string };

    const response = await RequisicaoProfessorService.get(id);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ message: response.message });
    }

    return reply.status(200).send(response.data);
  },

  updateStatus: async (request, reply) => {
    const { status } = request.body as updateStatusBody;
    const { id: idReq } = request.params as { id: string };
    const { id: idRevisor } = request.user as {id: string};

    const response = await RequisicaoProfessorService.updateStatus(
      idReq,
      idRevisor,
      status,
    );
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ message: response.message });
    }

    return reply.status(200).send(response.message);
  },
};
