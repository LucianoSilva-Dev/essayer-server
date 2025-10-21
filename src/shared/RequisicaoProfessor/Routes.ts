import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { authPlugin } from "../plugins/auth";
import { AddEntityWiseTags } from "../Utils";
import { RequisicaoProfessorSchema } from "./Schema";
import { RequisicaoProfessorController } from "./Controller";

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