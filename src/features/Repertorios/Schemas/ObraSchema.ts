import type { EntitySchema } from '../../../shared/Types';
import {
  createObraBodyValidation,
  updateObraBodyValidation,
} from '../Validations/ObraValidation';
import { genericSuccessResponse } from '../../../shared/Validations';
import { genericError, schemaValidationError } from '../../../shared/Schemas';

export const ObraSchema: EntitySchema = {
  create: {
    // placeholder para criação de obra
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
    // placeholder para atualização de obra (somente titulo, fonte, resumo, tipo e subtopicos)
    schema: {
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
