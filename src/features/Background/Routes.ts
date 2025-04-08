import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { BackgroundSchema } from './Schemas';
import { BackgroundController } from './Controller';

export const BackgroundRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/', BackgroundSchema.get_all, BackgroundController.get_all);
  app.get('/:id', BackgroundSchema.get, BackgroundController.get);
  app.post('/', BackgroundSchema.create, BackgroundController.create);
};
