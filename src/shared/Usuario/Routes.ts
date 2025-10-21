import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { authPlugin } from "../plugins/auth";
import { AddEntityWiseTags } from "../Utils";
import { UsuarioSchema } from "./Schema";
import { UsuarioController } from "./Controller";

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

  app.get('/:id/perfil', UsuarioSchema.perfil, UsuarioController.perfil);
};

