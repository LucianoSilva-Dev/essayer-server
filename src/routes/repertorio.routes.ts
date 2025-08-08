import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { RepertorioSchema } from '@/features/Repertorios/Schemas/RepertorioSchema';
import { CitacaoSchema } from '@/features/Repertorios/Schemas/CitacaoSchema';
import { ArtigoSchema } from '@/features/Repertorios/Schemas/ArtigoSchema';
import { ObraSchema } from '@/features/Repertorios/Schemas/ObraSchema';
import { CitacaoController } from '@/features/Repertorios/Controllers/CitacaoController';
import { RepertorioController } from '@/features/Repertorios/Controllers/RepertorioController';
import { ObraController } from '@/features/Repertorios/Controllers/ObraController';
import { ArtigoController } from '@/features/Repertorios/Controllers/ArtigoController';
import { authPlugin } from '@/shared/plugins/auth';
import { AddEntityWiseTags } from '@/shared/Utils';

export const RepertorioRoutes: FastifyPluginAsyncZod = async (app) => {
  AddEntityWiseTags(app, ['Repertório']);
  app.register(authPlugin);

  // <Rotas para repertórios em geral>
  app.get('/', RepertorioSchema.get_all, RepertorioController.get_all);
  app.delete('/:id', RepertorioSchema.delete, RepertorioController.delete);

  // comentarios
  app.post(
    '/:id/comentario',
    RepertorioSchema.createComentario,
    RepertorioController.comentarioCreate,
  );
  app.put(
    '/:id/comentario/:comentarioId',
    RepertorioSchema.updateComentario,
    RepertorioController.comentarioUpdate,
  );
  app.delete(
    '/:id/comentario/:comentarioId',
    RepertorioSchema.deleteComentario,
    RepertorioController.comentarioDelete,
  );

  //likes
  app.post(
    '/:id/like',
    RepertorioSchema.createLike,
    RepertorioController.likeCreate,
  );
  app.delete(
    '/:id/like',
    RepertorioSchema.deleteLike,
    RepertorioController.likeDelete,
  );

  // favoritos
  app.post(
    '/:id/favorito',
    RepertorioSchema.createFavorito,
    RepertorioController.favoritoCreate,
  );
  app.delete(
    '/:id/favorito',
    RepertorioSchema.deleteFavorito,
    RepertorioController.favoritoDelete,
  );

  // <Rotas para repertórios em geral/>

  // Rotas para Citações
  app.post('/citacao', CitacaoSchema.create, CitacaoController.citacaoCreate);
  app.put(
    '/citacao/:id',
    CitacaoSchema.update,
    CitacaoController.citacaoUpdate,
  );
  app.get('/citacao/:id', CitacaoSchema.get, CitacaoController.citacaoGet);

  // Rotas para Artigos
  app.post('/artigo', ArtigoSchema.create, ArtigoController.artigoCreate);
  app.put('/artigo/:id', ArtigoSchema.update, ArtigoController.artigoUpdate);
  app.get('/artigo/:id', ArtigoSchema.get, ArtigoController.artigoGet);

  // Rotas para Obras
  app.post('/obra', ObraSchema.create, ObraController.obraCreate);
  app.put('/obra/:id', ObraSchema.update, ObraController.obraUpdate);
  app.get('/obra/:id', ObraSchema.get, ObraController.obraGet);
};
