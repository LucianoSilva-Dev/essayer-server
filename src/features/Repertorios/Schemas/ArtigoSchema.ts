import { optionalAuthMiddleware } from '../../../shared/middlewares/Authentication';
import { authProfessorCreate } from '../../../shared/middlewares/Authorization';
import { genericError, schemaValidationError } from '../../../shared/Schemas';
import type { EntitySchema } from '../../../shared/Types';
import {
  genericSuccessResponse,
  idValidation,
} from '../../../shared/Validations';
import {
  createArtigoBodyValidation,
  getArtigoResponse,
  updateArtigoBodyValidation,
} from '../Validations/ArtigoValidation';
import { createRepertorioResponse } from '../Validations/RepertorioValidation';

export const ArtigoSchema: EntitySchema = {
  get: {
    preHandler: optionalAuthMiddleware,
    schema: {
      security: [{ accessTokenCookieAuth: [] }, {}],
      params: idValidation,
      response: {
        200: getArtigoResponse,
        400: schemaValidationError,
        401: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Recupera artigo selecionado',
    },
  },
  create: {
    preHandler: authProfessorCreate,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      body: createArtigoBodyValidation,
      response: {
        201: createRepertorioResponse,
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        500: genericError,
      },
      summary: 'Cria novo artigo',
    },
  },
  update: {
    preHandler: authProfessorCreate,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      params: idValidation,
      body: updateArtigoBodyValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Atualiza dados do artigo',
    },
  },
};
