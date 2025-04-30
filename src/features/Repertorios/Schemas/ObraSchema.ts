import type { EntitySchema } from '../../../shared/Types';
import {
  createObraBodyValidation,
  getObraResponse,
  updateObraBodyValidation,
} from '../Validations/ObraValidation';
import { genericSuccessResponse, idValidation } from '../../../shared/Validations';
import { genericError, schemaValidationError } from '../../../shared/Schemas';

export const ObraSchema: EntitySchema = {
  get: {
    schema: {
      params: idValidation,
      response: {
        200: getObraResponse,
        400: schemaValidationError,
        401: genericError,
        404: genericError,
        500: genericError,
      },
    },
  },
  create: {
    schema: {
      body: createObraBodyValidation,
      response: {
        201: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        500: genericError,
      },
      summary: 'Cria nova obra',
    },
  },
  update: {
    schema: {
      params: idValidation,
      body: updateObraBodyValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        500: genericError,
      },
      summary: 'Atualiza dados da obra',
    },
  },
};
