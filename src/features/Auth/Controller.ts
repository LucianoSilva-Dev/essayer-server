import type { Controller } from '../../shared/Types';
import type { userLoginBody } from './Types';
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
};
