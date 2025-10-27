import { z } from 'zod';
import { authAdmin, authProfessor } from '../middlewares/Authorization';
import { genericError, schemaValidationError } from '../Schemas';
import type { EntitySchema } from '../Types';
import { genericSuccessResponse, idValidation } from '../Validations';
import {
  getRequisicaoProfessorResponse,
  updateStatusBodyValidation,
} from './Validation';

export const RequisicaoProfessorSchema: EntitySchema = {
  getAll: {
    preHandler: authAdmin,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      response: {
        200: z.array(getRequisicaoProfessorResponse),
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        500: genericError,
      },
      summary: 'Recupera todas as requisições de cadastro de professores',
    },
  },

  get: {
    preHandler: authProfessor,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      params: idValidation,
      response: {
        200: getRequisicaoProfessorResponse,
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Recupera requisição de cadastro de professor selecionada',
    },
  },

  updateStatus: {
    preHandler: authAdmin,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      params: idValidation,
      body: updateStatusBodyValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Atualiza o status da requisição selecionada',
    },
  },
};
