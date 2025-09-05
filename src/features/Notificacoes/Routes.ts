import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { AddEntityWiseTags } from "../../shared/Utils";
import { authPlugin } from "../../shared/plugins/auth";
import { NotificacaoSchema } from "./Schema";
import { NotificacaoController } from "./Controller";
import { FastifySSEPlugin } from  'fastify-sse-v2'

export const NotificacaoRoutes: FastifyPluginAsyncZod = async (app) => {
  AddEntityWiseTags(app, ['Notificações']);
  app.register(authPlugin);
  app.register(FastifySSEPlugin)

  app.get('/', NotificacaoSchema.getAll, NotificacaoController.getAll);
  app.put('/', NotificacaoSchema.changeStatus, NotificacaoController.changeStatus)
  app.get('/listen', NotificacaoSchema.listen, NotificacaoController.listen)
};