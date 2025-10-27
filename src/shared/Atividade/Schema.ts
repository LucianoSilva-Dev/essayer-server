import { z } from 'zod';
import { authMiddleware } from '../middlewares/Authentication';
import { authProfessor } from '../middlewares/Authorization';
import { genericError, schemaValidationError } from '../Schemas';
import type { EntitySchema } from '../Types';
import { idValidation } from '../Validations';
import {
  AtividadesRecentesResponse,
  getAllAtividadesAlunoResponse,
} from './Validations';

export const AtividadeSchema: EntitySchema = {
  delete: {
    preHandler: authProfessor,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
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
      security: [{ accessTokenCookieAuth: [] }],
      response: {
        200: AtividadesRecentesResponse,
        400: schemaValidationError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary:
        'Retorna as quatro atividades mais recentes de todas as turmas criadas pelo professor.',
    },
  },

  getAllAtividadesAluno: {
    preHandler: authMiddleware,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      response: {
        200: getAllAtividadesAlunoResponse,
        400: schemaValidationError,
        403: genericError,
        500: genericError,
      },
      summary:
        'Retorna todas as atividades de todas as turmas que o usuário é membro.',
    },
  },
};
