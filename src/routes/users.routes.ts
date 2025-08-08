import { UsuarioSchema } from '@/schemas/users.schema';
import controller from '@/controllers/users';
import { authPlugin } from '@/shared/plugins/auth';
import { AddEntityWiseTags } from '@/shared/Utils';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

export const UsersRoutes: FastifyPluginAsyncZod = async (app) => {
  AddEntityWiseTags(app, ['Usuario']);
  app.register(authPlugin);

  app.get('/:id', UsuarioSchema.get, controller.getUserController);

  app.post('/', UsuarioSchema.create, controller.createUserController);
  app.post(
    '/professor',
    UsuarioSchema.professorCreate,
    controller.professorCreateController,
  );

  app.put('/:id', UsuarioSchema.update, controller.updateUserController);
  app.put(
    '/:id/senha',
    UsuarioSchema.updateSenha,
    controller.updateSenhaController,
  );

  app.delete('/:id', UsuarioSchema.delete, controller.deleteUserController);

  // TODO: Isso tem que ser outro domínio. É pertencente a T, mas não é T.
  // Fotos
  app.get('/foto/:id', UsuarioSchema.fotoGet, controller.fotoGetController);
  app.post(
    '/foto/:id',
    UsuarioSchema.fotoCreate,
    controller.fotoCreateController,
  );
  app.put(
    '/foto/:id',
    UsuarioSchema.fotoUpdate,
    controller.fotoUpdateController,
  );
  app.delete(
    '/foto/:id',
    UsuarioSchema.fotoDelete,
    controller.fotoDeleteController,
  );
};
