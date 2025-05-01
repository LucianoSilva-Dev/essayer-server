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

export const ArtigoSchema: EntitySchema = {
  get: {
    schema: {
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
      params: idValidation,
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
