import type { Controller } from '../../shared/Types';
import type { getTokenAuthBody, registerAuthBody } from './Types';
import { AuthService } from './Service';

export const AuthController: Controller = {
  getToken: async (request, reply) => {
    const response = await AuthService.getToken(
      request.body as getTokenAuthBody,
      reply,
    );
    if (!response.auth) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    return reply.status(200).send({ token: response.token });
  },

  register: async (request, reply) => {
    const response = await AuthService.register(
      request.body as registerAuthBody,
    );
    if (!response.success) {
      return reply
        .status(response.statusCode as number)
        .send({ error: response.error });
    }

    return reply.status(201).send({ message: response.message });
  },
};
