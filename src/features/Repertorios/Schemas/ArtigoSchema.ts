import { genericError, schemaValidationError } from '../../../shared/Schemas';
import type { EntitySchema } from '../../../shared/Types';
import { genericSuccessResponse } from '../../../shared/Validations';
import { createArtigoBodyValidation, updateArtigoBodyValidation } from '../Validations/ArtigoValidation';

export const ArtigoSchema: EntitySchema = {
  get: {

  },
  create: {
    schema: {
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
    schema: {
      body: updateArtigoBodyValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        500: genericError,
      },
      summary: 'Atualiza dados do artigo',
    },
  },
};
