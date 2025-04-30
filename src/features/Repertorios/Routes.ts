import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { RepertorioSchema } from './Schemas/RepertorioSchema';
import { CitacaoSchema } from './Schemas/CitacaoSchema';
import { ArtigoSchema } from './Schemas/ArtigoSchema';
import { ObraSchema } from './Schemas/ObraSchema';
import { RepertorioController } from './Controller';
import { authPlugin } from '../Auth/Plugins';
import { AddEntityWiseTags } from '../../shared/Utils';

export const RepertorioRoutes: FastifyPluginAsyncZod = async (app) => {
  AddEntityWiseTags(app, ['Repertório'])
  app.register(authPlugin);

  // Rotas para repertórios em geral
  app.get('/', RepertorioSchema.get_all, RepertorioController.get_all);
  app.delete('/:id', RepertorioSchema.delete, RepertorioController.delete);

  // Rotas para Citações
  app.post(
    '/citacao',
    CitacaoSchema.create,
    RepertorioController.citacaoCreate,
  );
  app.put('/citacao/:id', CitacaoSchema.update, RepertorioController.citacaoUpdate);

  // Rotas para Artigos
  app.post('/artigo', ArtigoSchema.create, RepertorioController.artigoCreate);
  app.put('/artigo/:id', ArtigoSchema.update, RepertorioController.artigoUpdate);

  // Rotas para Obras
  app.post('/obra', ObraSchema.create, RepertorioController.obraCreate);
  app.put('/obra/:id', ObraSchema.update, RepertorioController.obraUpdate);
};
