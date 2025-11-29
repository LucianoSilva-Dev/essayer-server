import { authMiddleware } from '../middlewares/Authentication';
import { genericError, schemaValidationError } from '../Schemas';
import type { EntitySchema } from '../Types';
import { idValidation } from '../Validations';
import {
  getRequisicaoUsuarioResponse,
  validateRequisicaoUsuarioBodyValidation,
  validateRequisicaoUsuarioResponse,
} from './Validation';

export const RequisicaoUsuarioSchema: EntitySchema = {
  validate: {
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      params: idValidation,
      body: validateRequisicaoUsuarioBodyValidation,
      response: {
        200: validateRequisicaoUsuarioResponse,
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
      security: [{ accessTokenCookieAuth: [] }],
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
