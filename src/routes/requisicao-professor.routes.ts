import { RequisicaoProfessorController } from '@/shared/controllers/RequisicaoProfessorController';
import { authPlugin } from '@/shared/plugins/auth';
import { RequisicaoProfessorSchema } from '@/shared/schemas/RequisicaoProfessorSchema';
import { AddEntityWiseTags } from '@/shared/Utils';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

export const RequisicaoProfessorRoutes: FastifyPluginAsyncZod = async (app) => {
  AddEntityWiseTags(app, ['RequisicaoProfessor']);
  app.register(authPlugin);

  app.get(
    '/',
    RequisicaoProfessorSchema.getAll,
    RequisicaoProfessorController.getAll,
  );
  app.get(
    '/:id',
    RequisicaoProfessorSchema.get,
    RequisicaoProfessorController.get,
  );
  app.put(
    '/:id/status',
    RequisicaoProfessorSchema.updateStatus,
    RequisicaoProfessorController.updateStatus,
  );
};
