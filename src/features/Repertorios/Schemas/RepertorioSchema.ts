import { genericError, schemaValidationError } from '../../../shared/Schemas';
import type { EntitySchema } from '../../../shared/Types';
import {
  genericSuccessResponse,
  idValidation,
} from '../../../shared/Validations';
import { createComentarioBodyValidation, getAllRepertorioQueryValidation, getAllRepertorioResponse } from '../Validations/RepertorioValidation';

export const RepertorioSchema: EntitySchema = {
  get_all: {
    schema: {
      querystring: getAllRepertorioQueryValidation,
      response: {
        
        400: schemaValidationError,
        401: genericError,
        500: genericError,
      },
      summary: 'Recupera todos os repertórios',
    },
  },
  delete: {
    schema: {
      params: idValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Exclui repertório selecionado',
    },
  },
  createComentario: {
    schema: {
      body: createComentarioBodyValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Cria um comentário no repertório selecionado',
    }
  }
};
