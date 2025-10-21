import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { authPlugin } from "../plugins/auth";
import { AddEntityWiseTags } from "../Utils";
import { RequisicaoMudancaSenhaController } from "./Controller";
import { RequisicaoMudancaSenhaSchema } from "./Schema";

export const RequisicaoMudancaSenhaRoutes: FastifyPluginAsyncZod = async (
  app,
) => {
  AddEntityWiseTags(app, ['RequisicaoMudancaSenha']);
  app.register(authPlugin);

  app.post(
    '/',
    RequisicaoMudancaSenhaSchema.create,
    RequisicaoMudancaSenhaController.create,
  );
  app.put(
    '/:id',
    RequisicaoMudancaSenhaSchema.validate,
    RequisicaoMudancaSenhaController.validate,
  );
  app.get(
    '/:id',
    RequisicaoMudancaSenhaSchema.get,
    RequisicaoMudancaSenhaController.get,
  );
};