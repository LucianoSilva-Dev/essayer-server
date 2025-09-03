import { authMiddleware } from "../../shared/middlewares/Authentication";
import { genericError } from "../../shared/Schemas";
import type { EntitySchema } from "../../shared/Types";
import { getAllNotificacaoResponse } from "./Validations";

export const NotificacaoSchema: EntitySchema = {
  getAll: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      response: {
        200: getAllNotificacaoResponse,
        401: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Obtêm todas as notificações de um usuario',
    },
  },

};
