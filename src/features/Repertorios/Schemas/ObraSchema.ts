import { optionalAuthMiddleware } from '../../../shared/middlewares/Authentication';
import { authProfessorCreate } from '../../../shared/middlewares/Authorization';
import { genericError, schemaValidationError } from '../../../shared/Schemas';
import type { EntitySchema } from '../../../shared/Types';
import {
  genericSuccessResponse,
  idValidation,
} from '../../../shared/Validations';
import {
  createObraBodyValidation,
  getObraResponse,
  updateObraBodyValidation,
} from '../Validations/ObraValidation';
import { createRepertorioResponse } from '../Validations/RepertorioValidation';

export const ObraSchema: EntitySchema = {
  get: {
    preHandler: optionalAuthMiddleware,
    schema: {
      security: [{ accessTokenCookieAuth: [] }, {}],
      params: idValidation,
      response: {
        200: getObraResponse,
        400: schemaValidationError,
        401: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Recupera obra selecionada',
    },
  },
  create: {
    preHandler: authProfessorCreate,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      body: createObraBodyValidation,
      response: {
        201: createRepertorioResponse,
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        500: genericError,
      },
      summary: 'Cria nova obra',
    },
  },
  update: {
    preHandler: authProfessorCreate,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      params: idValidation,
      body: updateObraBodyValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Atualiza dados da obra',
    },
  },
};
