import { authMiddleware } from '../middlewares/Authentication';
import { genericError, schemaValidationError } from '../Schemas';
import type { EntitySchema } from '../Types';
import { genericSuccessResponse, idValidation } from '../Validations';
import {
  getRequisicaoUsuarioResponse,
  validateRequisicaoUsuarioBodyValidation,
} from '../validations/RequisicaoUsuarioValidation';

export const RequisicaoUsuarioSchema: EntitySchema = {
  validate: {
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      body: validateRequisicaoUsuarioBodyValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        404: genericError,
        422: genericError,
        500: genericError,
      },
      summary: 'Valida o código enviado por e-mail para o usuário.',
    },
  },
  get: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      response: {
        200: getRequisicaoUsuarioResponse,
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Recupera requisição de cadastro de usuário selecionada.',
    },
  },
};
