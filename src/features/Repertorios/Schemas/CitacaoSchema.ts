import { optionalAuthMiddleware } from '../../../shared/middlewares/Authentication';
import { authProfessorCreate } from '../../../shared/middlewares/Authorization';
import { genericError, schemaValidationError } from '../../../shared/Schemas';
import type { EntitySchema } from '../../../shared/Types';
import {
  genericSuccessResponse,
  idValidation,
} from '../../../shared/Validations';
import {
  createCitacaoBodyValidation,
  getCitacaoResponse,
  updateCitacaoBodyValidation,
} from '../Validations/CitacaoValidation';
import { createRepertorioResponse } from '../Validations/RepertorioValidation';

export const CitacaoSchema: EntitySchema = {
  get: {
    preHandler: optionalAuthMiddleware,
    schema: {
      security: [{ accessTokenCookieAuth: [] }, {}],
      params: idValidation,
      response: {
        200: getCitacaoResponse,
        400: schemaValidationError,
        401: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Recupera citação selecionada',
    },
  },
  create: {
    preHandler: authProfessorCreate,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      body: createCitacaoBodyValidation,
      response: {
        201: createRepertorioResponse,
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        500: genericError,
      },
      summary: 'Cria nova citação',
    },
  },
  update: {
    preHandler: authProfessorCreate,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      params: idValidation,
      body: updateCitacaoBodyValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Atualiza citação existente',
    },
  },
};
