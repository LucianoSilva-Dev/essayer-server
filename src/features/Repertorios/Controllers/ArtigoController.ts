import type { Controller, RequestUserData } from '../../../shared/Types';
import { ArtigoService } from '../Services/ArtigoService';
import type { CreateArtigoBody, UpdateArtigoBody } from '../Types';

export const ArtigoController: Controller = {
  artigoGet: async (request, reply) => {
    const { id: artigoId } = request.params as { id: string };

    const response = await ArtigoService.get(artigoId);
    if (!response.success) {
      return reply.status(response.status).send({ message: response.message });
    }

    reply.send(response.data);
  },
  artigoCreate: async (request, reply) => {
    const { titulo, resumo, autor, fonte, subtopicos } =
      request.body as CreateArtigoBody;
    const { id: userId } = request.user as RequestUserData;

    const response = await ArtigoService.create(
      { titulo, resumo, autor, fonte, subtopicos },
      userId,
    );

    if (!response.success) {
      return reply.status(response.status).send({ message: response.message });
    }

    reply.status(201).send({ message: response.data });
  },
  artigoUpdate: async (request, reply) => {
    const { titulo, resumo, autor, fonte, subtopicos } =
      request.body as UpdateArtigoBody;
    const { id: artigoId } = request.params as { id: string };

    const response = await ArtigoService.update(
      { titulo, resumo, autor, fonte, subtopicos },
      artigoId,
    );

    if (!response.success) {
      return reply.status(response.status).send({ error: response.message });
    }

    reply.send({ message: response.data });
  },
};
