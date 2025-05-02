import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { RepertorioSchema } from './Schemas/RepertorioSchema';
import { CitacaoSchema } from './Schemas/CitacaoSchema';
import { ArtigoSchema } from './Schemas/ArtigoSchema';
import { ObraSchema } from './Schemas/ObraSchema';
import { CitacaoController } from './Controllers/CitacaoController';
import { RepertorioController } from './Controllers/RepertorioController';
import { ObraController } from './Controllers/ObraController';
import { ArtigoController } from './Controllers/ArtigoController';
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
  app.post('/citacao', CitacaoSchema.create, CitacaoController.citacaoCreate);
  app.put(
    '/citacao/:id',
    CitacaoSchema.update,
    CitacaoController.citacaoUpdate,
  );
  app.get('/citacao/:id', CitacaoSchema.get, RepertorioController.citacaoGet);

  // Rotas para Artigos
  app.post('/artigo', ArtigoSchema.create, ArtigoController.artigoCreate);
  app.put('/artigo/:id', ArtigoSchema.update, CitacaoController.artigoUpdate);
  app.get('/artigo/:id', ArtigoSchema.get, ArtigoController.artigoGet);

  // Rotas para Obras
  app.post('/obra', ObraSchema.create, ObraController.obraCreate);
  app.put('/obra/:id', ObraSchema.update, ObraController.obraUpdate);
  app.get('/obra/:id', ObraSchema.get, ObraController.obraGet);
};
