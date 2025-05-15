import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { AddEntityWiseTags } from './Utils';
import { authPlugin } from './plugins/auth';
import { UsuarioController } from './controllers/UsuarioController';
import { RequisicaoProfessorController } from './controllers/RequisicaoProfessorController';
import { UsuarioSchema } from './schemas/UsuarioSchema';
import { RequisicaoProfessorSchema } from './schemas/RequisicaoProfessorSchema';

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
