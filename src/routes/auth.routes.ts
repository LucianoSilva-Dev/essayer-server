import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { AuthSchema } from '@/features/Auth/Schemas';
import { AddEntityWiseTags } from '@/shared/Utils';
import { AuthController } from '@/features/Auth/Controller';
import { authPlugin } from '@/shared/plugins/auth';

export const AuthRoutes: FastifyPluginAsyncZod = async (app) => {
  AddEntityWiseTags(app, ['Auth']);
  // used to enable reply.jwtSign for the handlers
  app.register(authPlugin);

  app.post('/register', AuthSchema.register, AuthController.register);
  app.post('/login', AuthSchema.login, AuthController.login);
};
