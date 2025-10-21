import type { EntitySchema } from '../../../shared/Types';
import {
  createObraBodyValidation,
  getObraResponse,
  updateObraBodyValidation,
} from '../Validations/ObraValidation';
import {
  genericSuccessResponse,
  idValidation,
} from '../../../shared/Validations';
import { genericError, schemaValidationError } from '../../../shared/Schemas';
import {
  optionalAuthMiddleware,
} from '../../../shared/middlewares/Authentication';
import { authProfessorCreate } from '../../../shared/middlewares/Authorization';
import { createRepertorioResponse } from '../Validations/RepertorioValidation';

export const ObraSchema: EntitySchema = {
  get: {
    preHandler: optionalAuthMiddleware,
    schema: {
      security: [{ jwtAuth: [] }, {}],
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
      security: [{ jwtAuth: [] }],
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
      security: [{ jwtAuth: [] }],
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
