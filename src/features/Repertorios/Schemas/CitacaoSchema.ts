import type { EntitySchema } from '../../../shared/Types';
import { genericError, schemaValidationError } from '../../../shared/Schemas';
import { createCitacaoBodyValidation, getCitacaoResponse, updateCitacaoBodyValidation } from '../Validations/CitacaoValidation';
import { genericSuccessResponse, idValidation } from '../../../shared/Validations';

export const CitacaoSchema: EntitySchema = {
  get: {
      schema: {
        params: idValidation,
        response: {
          200: getCitacaoResponse,
          400: schemaValidationError,
          401: genericError,
          404: genericError,
          500: genericError,
        },
      },
    },
  create: {
    schema: {
      body: createCitacaoBodyValidation,
      response: {
        201: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        500: genericError,
      },
      summary: 'Cria nova citação',
    },
  },
  update: {
    schema: {
      params: idValidation,
      body: updateCitacaoBodyValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        500: genericError,
      },
      summary: 'Atualiza citação existente',
    },
  },
};
