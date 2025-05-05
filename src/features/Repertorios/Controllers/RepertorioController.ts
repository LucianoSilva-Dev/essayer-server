import type { Controller, RequestUserData } from '../../../shared/Types';
import { RepertorioService } from '../Services/RepertorioService';
import type { GetAllRepertorioQueryBody } from '../Types';

export const RepertorioController: Controller = {
  get_all: async (request, reply) => {
    const queryBody = request.query as GetAllRepertorioQueryBody;
    const { id: userId } = request.user as RequestUserData || ''
    
    const response = await RepertorioService.getAll(queryBody, request.url, userId);
    if (!response.success) {
      return reply.status(response.status).send({ message: response.message });
    }
    
    return reply.status(200).send(response.data);
  },
  delete: async (request, reply) => {
    reply.send({ message: 'delete repertorio' });
  },

  comentarioCreate: async (request, reply) => {
    reply.send({ message: 'create comentario' });
  },
  comentarioDelete: async (request, reply) => {
    reply.send({ message: 'delete comentario' });
  },

  likeCreate: async (request, reply) => {
    reply.send({ message: 'create like' });
  },
  likeDelete: async (request, reply) => {
    reply.send({ message: 'delete like' });
  },

  favoritoCreate: async (request, reply) => {
    reply.send({ message: 'create favorito' });
  },
  favoritoDelete: async (request, reply) => {
    reply.send({ message: 'delete favorito' });
  },
};
