import type { Controller } from '../../shared/Types';
import type { createBackgroundBody } from './Types';
import { BackgroundService } from './Service';
import type { getBackgroundResponseType } from './Types';

export const BackgroundController: Controller = {
  get_all: async (request, reply) => {
    const response = await BackgroundService.get_all();
    return reply.status(200).send(response);
  },

  get: async (request, reply) => {
    const { id } = request.params as { id: string };

    const response = await BackgroundService.get(id);
    if (!response.success) {
      return reply.status(response.statusCode as number).send({
        error: response.error,
      });
    }

    return reply.status(200).send(response.background);
  },

  create: async (request, reply) => {
    const backgroundBody = request.body as createBackgroundBody;
    const response = await BackgroundService.create(backgroundBody);
    return reply.status(201).send({ message: response.message });
  },
};
