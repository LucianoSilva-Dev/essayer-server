import { z } from 'zod';
import { authProfessor } from '../middlewares/Authorization';
import type { EntitySchema } from '../Types';
import { idValidation } from '../Validations';
import { genericError, schemaValidationError } from '../Schemas';
import { AtividadesRecentesResponse } from './Validations';

export const AtividadeSchema: EntitySchema = {
  delete: {
    preHandler: authProfessor,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      response: {
        204: z.void(),
        400: schemaValidationError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Exclui uma atividade.',
    },
  },

  recentes: {
    preHandler: authProfessor,
    schema: {
      security: [{ jwtAuth: [] }],
      response: {
        200: AtividadesRecentesResponse,
        400: schemaValidationError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Retorna as quatro atividades mais recentes de todas as turmas criadas pelo professor.',
    },
  }
};
