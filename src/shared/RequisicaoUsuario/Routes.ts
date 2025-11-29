import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { AddEntityWiseTags } from "../Utils";
import { authPlugin } from "../plugins/auth";
import { RequisicaoUsuarioSchema } from "./Schema";
import { RequisicaoUsuarioController } from "./Controller";

export const RequisicaoUsuarioRoutes: FastifyPluginAsyncZod = async (app) => {
  AddEntityWiseTags(app, ['RequisicaoUsuario']);
  app.register(authPlugin);

  app.put(
    '/:id',
    RequisicaoUsuarioSchema.validate,
    RequisicaoUsuarioController.validate,
  );
  app.get('/:id', RequisicaoUsuarioSchema.get, RequisicaoUsuarioController.get);
};