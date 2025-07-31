import type { Controller } from '../../shared/Types';
import type { userLoginBody, userRegisterBody } from './Types';
import { AuthService } from './Service';

export const AuthController: Controller = {
  login: async (request, reply) => {
    const response = await AuthService.login(
      request.body as userLoginBody,
      reply,
    );
    if (!response.auth) {
      return reply.status(401).send({ error: 'Credenciais inválidas.' });
    }

    return reply.status(200).send({ token: response.token });
  },

  register: async (request, reply) => {
    const response = await AuthService.register(
      request.body as userRegisterBody,
    );
    if (!response.success) {
      return reply
        .status(response.statusCode as number)
        .send({ error: response.error });
    }

    return reply.status(201).send({ message: response.message });
  },
};
