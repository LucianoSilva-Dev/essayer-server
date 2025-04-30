import { genericError } from '../../../shared/Schemas';
import type { EntitySchema } from '../../../shared/Types';
import {
  genericSuccessResponse,
  idValidation,
} from '../../../shared/Validations';
import { getAllRepertorioResponse } from '../Validations/RepertorioValidation';

export const RepertorioSchema: EntitySchema = {
  get_all: {
    schema: {
      response: {
        200: getAllRepertorioResponse,
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
        400: genericError,
        401: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Exclui repertório selecionado',
    },
  },
};
