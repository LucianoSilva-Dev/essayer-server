import { RequisicaoUsuarioController } from '@/shared/controllers/RequisicaoUsuarioController';
import { authPlugin } from '@/shared/plugins/auth';
import { RequisicaoUsuarioSchema } from '@/shared/schemas/RequisicaoUsuarioSchema';
import { AddEntityWiseTags } from '@/shared/Utils';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

export const RequisicaoUsuarioRoutes: FastifyPluginAsyncZod = async (app) => {
  AddEntityWiseTags(app, ['RequisicaoUsuario']);
  app.register(authPlugin);

  app.put(
    '/:id',
    RequisicaoUsuarioSchema.validate,
    RequisicaoUsuarioController.validate,
  );
  app.get('/:id', RequisicaoUsuarioSchema.get, RequisicaoUsuarioController.get);
};
