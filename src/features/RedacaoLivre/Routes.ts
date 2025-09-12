import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { AddEntityWiseTags } from '../../shared/Utils';
import { authPlugin } from '../../shared/plugins/auth';
import { RedacaoLivreSchema } from './Schema';
import { RedacaoLivreController } from './Controller';

export const RedacaoLivreRoutes: FastifyPluginAsyncZod = async (app) => {
  AddEntityWiseTags(app, ['RedacaoLivre']);
  app.register(authPlugin);

  app.post('/', RedacaoLivreSchema.create, RedacaoLivreController.create);
  app.get('/', RedacaoLivreSchema.getAll, RedacaoLivreController.getAll);
  app.get('/:id', RedacaoLivreSchema.get, RedacaoLivreController.get);
  app.put('/:id', RedacaoLivreSchema.update, RedacaoLivreController.update);
  app.delete('/:id', RedacaoLivreSchema.delete, RedacaoLivreController.delete);
  app.post(':id/corrigir', RedacaoLivreSchema.corrigir, RedacaoLivreController.corrigir)
  app.get(':id/correcao/listen', RedacaoLivreSchema.listenCorrecao, RedacaoLivreController.listenCorrecao)
};
