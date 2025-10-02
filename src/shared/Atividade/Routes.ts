import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { AddEntityWiseTags } from '../Utils';
import { authPlugin } from '../plugins/auth';
import { AtividadeController } from './Controller';
import { RedacaoController } from './Redacao/Controller';
import { RedacaoSchema } from './Redacao/Schema';
import { AtividadeSchema } from './Schema';

export const AtividadeRoutes: FastifyPluginAsyncZod = async (app) => {
  AddEntityWiseTags(app, ['Atividade']);
  app.register(authPlugin);

  app.post('/redacao', RedacaoSchema.create, RedacaoController.create);
  app.get('/redacao/:id', RedacaoSchema.get, RedacaoController.get);
  app.put('/redacao/:id', RedacaoSchema.update, RedacaoController.update);
  app.get(
    '/redacao/:id/respostas',
    RedacaoSchema.getAllRespostasRedacao,
    RedacaoController.getAllRespostasRedacao,
  );

  app.get('/recentes', AtividadeSchema.recentes, AtividadeController.recentes);

  app.post(
    '/redacao/:id/iniciar',
    RedacaoSchema.start,
    RedacaoController.start,
  );
  app.post('/redacao/:id/enviar', RedacaoSchema.send, RedacaoController.send);
  app.put(
    '/respostas/:id/feedback',
    RedacaoSchema.feedback,
    RedacaoController.feedback,
  );

  app.delete('/:id', AtividadeSchema.delete, AtividadeController.delete);
};
