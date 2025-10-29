// src/features/Auth/Routes.ts
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { authPlugin } from '../../shared/plugins/auth';
import { AddEntityWiseTags } from '../../shared/Utils';
import { AuthController } from './Controller';
import { AuthSchema } from './Schemas';

export const AuthRoutes: FastifyPluginAsyncZod = async (app) => {
  AddEntityWiseTags(app, ['Auth']);
  app.register(authPlugin);

  app.post('/login', AuthSchema.login, AuthController.login);
  app.post('/refresh', AuthSchema.refresh, AuthController.refresh);
  app.post('/logout', AuthSchema.logout, AuthController.logout);
  app.get('/me', AuthSchema.getUserInfo, AuthController.getUserInfo);
};
