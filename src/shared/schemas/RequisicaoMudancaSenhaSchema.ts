import { authMiddleware } from '../middlewares/Authentication';
import { genericError, schemaValidationError } from '../Schemas';
import type { EntitySchema } from '../Types';
import { createRequisicaoMudancaSenhaResponse, getRequisicaoMudancaSenhaResponse, validateRequisicaoMudancaSenhaBodyValidation } from '../validations/RequisicaoMudancaSenhaValidation';
import { genericSuccessResponse, idValidation } from '../Validations';

export const RequisicaoMudancaSenhaSchema: EntitySchema = {
  create: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      response: {
        201: createRequisicaoMudancaSenhaResponse,
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: "Cria uma requisição de mudança de senha e retorna o id da requisição."
    },
  },
  validate: {
    preHandler: authMiddleware,
    schema: {
        security: [{ jwtAuth: [] }],
        params: idValidation,
        body: validateRequisicaoMudancaSenhaBodyValidation,
        response: {
            200: genericSuccessResponse,
            400: schemaValidationError,
            401: genericError,
            403: genericError,
            404: genericError,
            422: genericError,
            500: genericError
        },
        summary: "Valida o código enviado por e-mail para o usuário."
    }
  },
  get: {
    preHandler: authMiddleware,
    schema: {
        security: [{ jwtAuth: [] }],
        params: idValidation,
        response: {
            200: getRequisicaoMudancaSenhaResponse,
            400: schemaValidationError,
            401: genericError,
            403: genericError,
            404: genericError,
            500: genericError
        },
        summary: "Recupera requisição de mudança de senha selecionada."
    }
  },
};
