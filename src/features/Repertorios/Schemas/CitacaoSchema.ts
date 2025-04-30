import type { EntitySchema } from '../../../shared/Types';
import { genericError, schemaValidationError } from '../../../shared/Schemas';
import { createCitacaoBodyValidation, updateCitacaoBodyValidation } from '../Validations/CitacaoValidation';
import { genericSuccessResponse } from '../../../shared/Validations';

export const CitacaoSchema: EntitySchema = {
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
