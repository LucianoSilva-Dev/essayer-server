import { genericError, schemaValidationError } from '../../../shared/Schemas';
import type { EntitySchema } from '../../../shared/Types';
import {
  genericSuccessResponse,
  idValidation,
} from '../../../shared/Validations';
import {
  authMiddleware,
  optionalAuthMiddleware,
} from '../../../shared/middlewares/Authentication';
import {
  createArtigoBodyValidation,
  getArtigoResponse,
  updateArtigoBodyValidation,
} from '../Validations/ArtigoValidation';

export const ArtigoSchema: EntitySchema = {
  get: {
    preHandler: optionalAuthMiddleware,
    schema: {
      security: [{ jwtAuth: [] }, {}],
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
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      body: createArtigoBodyValidation,
      response: {
        201: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        500: genericError,
      },
      summary: 'Cria novo artigo',
    },
  },
  update: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      body: updateArtigoBodyValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Atualiza dados do artigo',
    },
  },
};
