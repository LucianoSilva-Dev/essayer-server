import { RequisicaoMudancaSenhaController } from '@/shared/controllers/RequisicaoMudancaSenhaController';
import { authPlugin } from '@/shared/plugins/auth';
import { RequisicaoMudancaSenhaSchema } from '@/shared/schemas/RequisicaoMudancaSenhaSchema';
import { AddEntityWiseTags } from '@/shared/Utils';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

export const RequisicaoMudancaSenhaRoutes: FastifyPluginAsyncZod = async (
  app,
) => {
  AddEntityWiseTags(app, ['RequisicaoMudancaSenha']);
  app.register(authPlugin);

  app.post(
    '/',
    RequisicaoMudancaSenhaSchema.create,
    RequisicaoMudancaSenhaController.create,
  );
  app.put(
    '/:id',
    RequisicaoMudancaSenhaSchema.validate,
    RequisicaoMudancaSenhaController.validate,
  );
  app.get(
    '/:id',
    RequisicaoMudancaSenhaSchema.get,
    RequisicaoMudancaSenhaController.get,
  );
};
