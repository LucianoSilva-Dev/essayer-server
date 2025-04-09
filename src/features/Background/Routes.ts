import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { BackgroundSchema } from './Schemas';
import { AddEntityWiseTags } from '../../shared/Utils';
import { BackgroundController } from './Controller';
import { authPlugin } from '../Auth/Plugins';

export const BackgroundRoutes: FastifyPluginAsyncZod = async (app) => {
  AddEntityWiseTags(app, ['Background']);
  // enable the possibility to use the authMiddleware to protect the endpoints.
  app.register(authPlugin)

  app.get('/', BackgroundSchema.get_all, BackgroundController.get_all);
  app.get('/:id', BackgroundSchema.get, BackgroundController.get);
  app.post('/', BackgroundSchema.create, BackgroundController.create);
};
