import { z } from "zod";
import { authMiddleware } from "../../shared/middlewares/Authentication";
import type { EntitySchema } from "../../shared/Types";
import { genericError, schemaValidationError } from "../../shared/Schemas";
import { idValidation } from "../../shared/Validations";
import { createRedacaoLivreBodyValidation, getRedacaoLivreResponse, updateRedacaoLivreBodyValidation } from "./Validations";

export const RedacaoLivreSchema: EntitySchema = {
  create: {
    preHandler: authMiddleware,
    schema: {
      security: [{jwtAuth: []}],
      body: createRedacaoLivreBodyValidation,
      response: {
        201: z.void(),
        400: schemaValidationError,
        403: genericError,
        500: genericError
      },
      summary: "Cria um rascunho de redação livre."
    }
  },
  getAll: {
    preHandler: authMiddleware,
    schema: {
      security: [{jwtAuth: []}],
      response: {
        200: z.array(getRedacaoLivreResponse),
        400: schemaValidationError,
        403: genericError,
        500: genericError
      },
      summary: "Recupera todas as redações livres do aluno."
    }
  },
  get: {
    preHandler: authMiddleware,
    schema:{
      security: [{ jwtAuth: [] }],
      params: idValidation,
      response: {
        200: getRedacaoLivreResponse,
        400: schemaValidationError,
        403: genericError,
        404: genericError,
        500: genericError
      },
      summary: "Recupera uma redação livre específica."
    }
  },
  update: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      body: updateRedacaoLivreBodyValidation,
      response: {
        200: z.void(),
        400: schemaValidationError,
        403: genericError,
        404: genericError,
        500: genericError
      },
      summary: "Salva o progresso ou finaliza a redação livre."
    }
  },
  delete: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      response: {
        204: z.void(),
        400: schemaValidationError,
        403: genericError,
        404: genericError,
        500: genericError
      },
      summary: "Exclui uma redação livre."
    }
  },
   corrigir: {
    preHandler: authMiddleware,
    schema: {
      security: [{jwtAuth: []}],
      response: {
        200: z.array(getRedacaoLivreResponse),
        403: genericError,
        404: genericError,
        500: genericError
      },
      summary: "Recupera todas as redações livres do aluno."
    }
  },
  listenCorrecao: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      summary: "E"
    }
  },
}