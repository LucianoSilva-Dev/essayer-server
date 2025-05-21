import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { AddEntityWiseTags } from './Utils';
import { authPlugin } from './plugins/auth';
import { UsuarioController } from './controllers/UsuarioController';
import { RequisicaoProfessorController } from './controllers/RequisicaoProfessorController';
import { UsuarioSchema } from './schemas/UsuarioSchema';
import { RequisicaoProfessorSchema } from './schemas/RequisicaoProfessorSchema';
import { RequisicaoUsuarioController } from './controllers/RequisicaoUsuarioController';
import { RequisicaoMudancaSenhaController } from './controllers/RequisicaoMudancaSenhaController';
import { RequisicaoMudancaSenhaSchema } from './schemas/RequisicaoMudancaSenhaSchema';
import { RequisicaoUsuarioSchema } from './schemas/RequisicaoUsuarioSchema';

export const UsuarioRoutes: FastifyPluginAsyncZod = async (app) => {
  AddEntityWiseTags(app, ['Usuario']);
  app.register(authPlugin);

  app.get('/:id', UsuarioSchema.get, UsuarioController.get);

  app.post('/', UsuarioSchema.create, UsuarioController.create);
  app.post(
    '/professor',
    UsuarioSchema.professorCreate,
    UsuarioController.professorCreate,
  );

  app.put('/:id', UsuarioSchema.update, UsuarioController.update);
  app.put('/:id/senha', UsuarioSchema.updateSenha, UsuarioController.updateSenha);

  app.delete('/:id', UsuarioSchema.delete, UsuarioController.delete);

  // Fotos
  app.post('/foto/:id', UsuarioSchema.fotoCreate, UsuarioController.fotoCreate);
  app.put('/foto/:id', UsuarioSchema.fotoUpdate, UsuarioController.fotoUpdate);
  app.delete(
    '/foto/:id',
    UsuarioSchema.fotoDelete,
    UsuarioController.fotoDelete,
  );
};

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

export const RequisicaoUsuarioRoutes: FastifyPluginAsyncZod = async (app) => {
  AddEntityWiseTags(app, ['RequisicaoUsuario']);
  app.register(authPlugin);

  app.put('/:id', RequisicaoUsuarioSchema.validate, RequisicaoUsuarioController.validate);
  app.get('/:id', RequisicaoUsuarioSchema.get, RequisicaoUsuarioController.get);
};

export const RequisicaoMudancaSenhaRoutes: FastifyPluginAsyncZod = async (
  app,
) => {
  AddEntityWiseTags(app, ['RequisicaoMudancaSenha']);
  app.register(authPlugin);

  app.post('/', RequisicaoMudancaSenhaSchema.create, RequisicaoMudancaSenhaController.create);
  app.put('/:id', RequisicaoMudancaSenhaSchema.validate, RequisicaoMudancaSenhaController.validate);
  app.get('/:id', RequisicaoMudancaSenhaSchema.get, RequisicaoUsuarioController.get);
};
