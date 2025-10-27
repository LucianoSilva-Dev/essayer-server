import { authMiddleware } from '../middlewares/Authentication';
import { genericError, schemaValidationError } from '../Schemas';
import type { EntitySchema } from '../Types';
import { genericSuccessResponse, idValidation } from '../Validations';
import {
  createRequisicaoMudancaSenhaBodyValidation,
  createRequisicaoMudancaSenhaResponse,
  getRequisicaoMudancaSenhaResponse,
  validateRequisicaoMudancaSenhaBodyValidation,
} from './Validation';

export const RequisicaoMudancaSenhaSchema: EntitySchema = {
  create: {
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      body: createRequisicaoMudancaSenhaBodyValidation,
      response: {
        201: createRequisicaoMudancaSenhaResponse,
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary:
        'Cria uma requisição de mudança de senha e retorna o id da requisição.',
    },
  },
  validate: {
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      params: idValidation,
      body: validateRequisicaoMudancaSenhaBodyValidation,
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
      security: [{ accessTokenCookieAuth: [] }],
      params: idValidation,
      response: {
        200: getRequisicaoMudancaSenhaResponse,
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Recupera requisição de mudança de senha selecionada.',
    },
  },
};
