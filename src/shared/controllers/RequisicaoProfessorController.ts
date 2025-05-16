import { RequisicaoProfessorService } from '../services/RequisicaoProfessorService';
import type { Controller, RequestUserData, updateStatusBody } from '../Types';

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
        .send({ error: response.message });
    }

    return reply.status(200).send(response.data);
  },

  updateStatus: async (request, reply) => {
    const { status } = request.body as updateStatusBody;
    const { id: idReq } = request.params as { id: string };
    const { id: idRevisor, cargo } = request.user as RequestUserData;

    if (cargo !== 'admin') {
      return reply
        .status(403)
        .send({
          error: 'Somente admins podem revisar requisições de cadastro.',
        });
    }

    const response = await RequisicaoProfessorService.updateStatus(
      idReq,
      idRevisor,
      status,
    );
    
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send({ message: response.message });
  },
};
