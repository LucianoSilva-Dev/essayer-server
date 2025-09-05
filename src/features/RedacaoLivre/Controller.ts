import type { Controller, RequestUserData } from '../../shared/Types';
import { RedacaoLivreService } from './Service';
import type { CreateRedacaoLivreBody, UpdateRedacaoLivreBody } from './Types';

export const RedacaoLivreController: Controller = {
  create: async (request, reply) => {
    const { tema } = request.body as CreateRedacaoLivreBody;
    const { id } = request.user as RequestUserData;

    const response = await RedacaoLivreService.create(tema, id);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(201).send();
  },
  getAll: async (request, reply) => {
    const { id } = request.user as RequestUserData;

    const response = await RedacaoLivreService.getAll(id);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send(response.data);
  },
  get: async (request, reply) => {
    const { id } = request.params as {id: string};
    const { id: requisitante } = request.user as RequestUserData;

    const response = await RedacaoLivreService.get(id, requisitante);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send(response.data);
  },
  update: async (request, reply) => {
    const { id } = request.params as {id: string};
    const { id: requisitante } = request.user as RequestUserData;
    const body = request.body as UpdateRedacaoLivreBody

    const response = await RedacaoLivreService.update(id, body, requisitante);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send();
  },
  delete: async (request, reply) => {
    const { id } = request.params as {id: string};
    const { id: requisitante } = request.user as RequestUserData;

    const response = await RedacaoLivreService.delete(id, requisitante);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(204).send();
  },
};
