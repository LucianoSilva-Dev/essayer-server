import { UsuarioSchema } from '@/schemas/users.schema';
import { UsuarioController } from '@/shared/controllers/UsuarioController';
import { authPlugin } from '@/shared/plugins/auth';
import { AddEntityWiseTags } from '@/shared/Utils';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

export const UsersRoutes: FastifyPluginAsyncZod = async (app) => {
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
  app.put(
    '/:id/senha',
    UsuarioSchema.updateSenha,
    UsuarioController.updateSenha,
  );

  app.delete('/:id', UsuarioSchema.delete, UsuarioController.delete);

  // Fotos
  app.get('/foto/:id', UsuarioSchema.fotoGet, UsuarioController.fotoGet);
  app.post('/foto/:id', UsuarioSchema.fotoCreate, UsuarioController.fotoCreate);
  app.put('/foto/:id', UsuarioSchema.fotoUpdate, UsuarioController.fotoUpdate);
  app.delete(
    '/foto/:id',
    UsuarioSchema.fotoDelete,
    UsuarioController.fotoDelete,
  );
};
