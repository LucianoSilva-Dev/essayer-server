import type { Controller, RequestUserData } from '../../../shared/Types';
import { RepertorioService } from '../Services/RepertorioService';
import type { CreateComentarioBody, GetAllRepertorioQueryBody, UpdateComentarioBody } from '../Types';

export const RepertorioController: Controller = {
  get_all: async (request, reply) => {
    const queryBody = request.query as GetAllRepertorioQueryBody;
    const { id: userId } = (request.user as RequestUserData) || '';

    const response = await RepertorioService.getAll(
      queryBody,
      request.url,
      userId,
    );
    if (!response.success) {
      return reply.status(response.status).send({ error: response.message });
    }

    return reply.status(200).send(response.data);
  },
  delete: async (request, reply) => {
    const { id: repertorioId } = request.params as { id: string };
    const { id: userId, cargo } = request.user as RequestUserData;

    const response = await RepertorioService.delete(repertorioId, userId, cargo);
    if (!response.success) {
      return reply.status(response.status).send({ error: response.message });
    }
    return reply.send({ message: response.data });
  },

  comentarioCreate: async (request, reply) => {
    const { id: repertorioId } = request.params as { id: string };
    const { texto } = request.body as CreateComentarioBody;
    const { id: userId } = (request.user as RequestUserData) || '';

    const response = await RepertorioService.createComentario(
      repertorioId,
      userId,
      { texto },
    );
    if (!response.success) {
      return reply.status(response.status).send({ error: response.message });
    }

    return reply.send({ message: response.data });
  },
  comentarioUpdate: async (request, reply) => {
    const { id: repertorioId, comentarioId } = request.params as { id: string, comentarioId: string };
    const { texto } = request.body as UpdateComentarioBody;
    const { id: userId, cargo } = request.user as RequestUserData;

    const response = await RepertorioService.updateComentario(repertorioId, comentarioId, userId, cargo, {texto});
    if (!response.success) {
      return reply.status(response.status).send({ error: response.message });
    }

    return reply.send({ message: response.data });
  },
  comentarioDelete: async (request, reply) => {
    const { id: repertorioId, comentarioId } = request.params as { id: string, comentarioId: string };
    const { id: userId, cargo} = request.user as RequestUserData;

    const response = await RepertorioService.deleteComentario(repertorioId, comentarioId, userId, cargo);
    if (!response.success) {
      return reply.status(response.status).send({ error: response.message });
    }

    return reply.send({ message: response.data });
  },

  likeCreate: async (request, reply) => {
    const { id: repertorioId } = request.params as { id: string };
    const { id: userId } = (request.user as RequestUserData) || '';

    const response = await RepertorioService.createLike(repertorioId, userId);
    if (!response.success) {
      return reply.status(response.status).send({ error: response.message });
    }

    return reply.send({ message: response.data });
  },
  likeDelete: async (request, reply) => {
    const { id: repertorioId } = request.params as { id: string };
    const { id: userId } = (request.user as RequestUserData) || '';

    const response = await RepertorioService.deleteLike(repertorioId, userId);
    if (!response.success) {
      return reply.status(response.status).send({ error: response.message });
    }

    return reply.send({ message: response.data });
  },

  favoritoCreate: async (request, reply) => {
    const { id: repertorioId } = request.params as { id: string };
    const { id: userId } = (request.user as RequestUserData) || '';

    const response = await RepertorioService.createFavorito(repertorioId, userId);
    if (!response.success) {
      return reply.status(response.status).send({ error: response.message });
    }

    return reply.send({ message: response.data });
  },
  favoritoDelete: async (request, reply) => {
    const { id: repertorioId } = request.params as { id: string };
    const { id: userId } = (request.user as RequestUserData) || '';

    const response = await RepertorioService.deleteFavorito(repertorioId, userId);
    if (!response.success) {
      return reply.status(response.status).send({ error: response.message });
    }

    return reply.send({ message: response.data });
  },
};