import type { EntitySchema } from '../../../shared/Types';
import { genericError, schemaValidationError } from '../../../shared/Schemas';
import {
  createCitacaoBodyValidation,
  getCitacaoResponse,
  updateCitacaoBodyValidation,
} from '../Validations/CitacaoValidation';
import {
  genericSuccessResponse,
  idValidation,
} from '../../../shared/Validations';
import {
  authMiddleware,
  optionalAuthMiddleware,
} from '../../../shared/middlewares/Authentication';
import { authProfessor } from '../../../shared/middlewares/Authorization';

export const CitacaoSchema: EntitySchema = {
  get: {
    preHandler: optionalAuthMiddleware,
    schema: {
      security: [{ jwtAuth: [] }, {}],
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
    preHandler: authProfessor,
    schema: {
      security: [{ jwtAuth: [] }],
      body: createCitacaoBodyValidation,
      response: {
        201: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        500: genericError,
      },
      summary: 'Cria nova citação',
    },
  },
  update: {
    preHandler: authProfessor,
    schema: {
      security: [{ jwtAuth: [] }],
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
