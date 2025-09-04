import { z } from "zod";
import { authMiddleware } from "../../shared/middlewares/Authentication";
import { genericError } from "../../shared/Schemas";
import type { EntitySchema } from "../../shared/Types";
import { changeStatusNotificacaoBodyValidation, getAllNotificacaoResponse, listenNotificacaoUserIdValidation } from "./Validations";
import { idValidation } from "../../shared/Validations";

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
  changeStatus: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      body: changeStatusNotificacaoBodyValidation,
      response: {
        204: z.void(),
        401: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Marca notificações de um usuario como lidas',
    },
  },

  listen: {
    preHandler: authMiddleware,
    schema: {
      params: listenNotificacaoUserIdValidation,
      security: [{ jwtAuth: [] }],
      summary: 'Escuta novas notificações',
    },
  },

};
