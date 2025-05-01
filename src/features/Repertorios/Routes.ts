import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { RepertorioSchema } from './Schemas/RepertorioSchema';
import { CitacaoSchema } from './Schemas/CitacaoSchema';
import { ArtigoSchema } from './Schemas/ArtigoSchema';
import { ObraSchema } from './Schemas/ObraSchema';
import { RepertorioController } from './Controller';
import { authPlugin } from '../Auth/Plugins';
import { AddEntityWiseTags } from '../../shared/Utils';

export const RepertorioRoutes: FastifyPluginAsyncZod = async (app) => {
  AddEntityWiseTags(app, ['Repertório']);
  app.register(authPlugin);

  // Rotas para repertórios em geral
  app.get('/', RepertorioSchema.get_all, RepertorioController.get_all);
  app.delete('/:id', RepertorioSchema.delete, RepertorioController.delete);
  app.post(
    '/:id/comentario',
    RepertorioSchema.createComentario,
    RepertorioController.comentarioCreate,
  );

  // Rotas para Citações
  app.post(
    '/citacao',
    CitacaoSchema.create,
    RepertorioController.citacaoCreate,
  );
  app.put(
    '/citacao/:id',
    CitacaoSchema.update,
    RepertorioController.citacaoUpdate,
  );
  app.get('/citacao/:id', CitacaoSchema.get, RepertorioController.citacaoGet);

  // Rotas para Artigos
  app.post('/artigo', ArtigoSchema.create, RepertorioController.artigoCreate);
  app.put(
    '/artigo/:id',
    ArtigoSchema.update,
    RepertorioController.artigoUpdate,
  );
  app.get('/artigo/:id', ArtigoSchema.get, RepertorioController.artigoGet);

  // Rotas para Obras
  app.post('/obra', ObraSchema.create, RepertorioController.obraCreate);
  app.put('/obra/:id', ObraSchema.update, RepertorioController.obraUpdate);
  app.get('/obra/:id', ObraSchema.get, RepertorioController.obraGet);
};
