import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { authPlugin } from '../../shared/plugins/auth';
import { AddEntityWiseTags } from '../../shared/Utils';
import { AtividadeController } from './Controller';
import { AtividadeSchema } from './Schema';

export const AtividadeRoutes: FastifyPluginAsyncZod = async (app) => {
  AddEntityWiseTags(app, ['Atividade']);
  app.register(authPlugin);

  // Turma
  app.post('/question', AtividadeSchema.askAI, AtividadeController.askAI)
};