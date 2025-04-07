import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { AuthSchema } from './Schemas';
import { AddEntityWiseTags } from '../../shared/Utils';
import { AuthController } from './Controller';
import { authPlugin } from './Plugins';

export const AuthRoutes: FastifyPluginAsyncZod = async (app) => {
  AddEntityWiseTags(app, ['Auth']);
  // used to enable reply.jwtSign for the handlers
  app.register(authPlugin);

  app.post('/register', AuthSchema.register, AuthController.register);
  app.post('/login', AuthSchema.getToken, AuthController.getToken);
};
