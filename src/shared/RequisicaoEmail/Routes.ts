import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { AddEntityWiseTags } from "../Utils";
import { authPlugin } from "../plugins/auth";
import { RequisicaoEmailSchema } from "./Schema";
import { RequisicaoEmailController } from "./Controller";

export const RequisicaoEmailRoutes: FastifyPluginAsyncZod = async (app) => {
  AddEntityWiseTags(app, ['RequisicaoEmail']);
  app.register(authPlugin);

  app.post(
    '/',
    RequisicaoEmailSchema.create,
    RequisicaoEmailController.create,
  );
  app.put('/:id', RequisicaoEmailSchema.validate, RequisicaoEmailController.validate);
};