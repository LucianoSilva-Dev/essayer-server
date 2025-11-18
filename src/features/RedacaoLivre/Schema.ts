import { z } from 'zod';
import {
  authMiddleware,
  sseAuthMiddleware,
} from '../../shared/middlewares/Authentication';
import { genericError, schemaValidationError } from '../../shared/Schemas';
import type { EntitySchema } from '../../shared/Types';
import { idValidation } from '../../shared/Validations';
import {
  corrigirRedacaoBodyValidation,
  createRedacaoLivreBodyValidation,
  createRedacaoLivreResponse,
  getAllRedacaoLivreResponse,
  getRedacaoLivreResponse,
  updateRedacaoLivreBodyValidation,
} from './Validations';

export const RedacaoLivreSchema: EntitySchema = {
  create: {
    preHandler: authMiddleware,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      body: createRedacaoLivreBodyValidation,
      response: {
        201: createRedacaoLivreResponse,
        400: schemaValidationError,
        403: genericError,
        500: genericError,
      },
      summary: 'Cria um rascunho de redação livre.',
    },
  },
  getAll: {
    preHandler: authMiddleware,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      response: {
        200: z.array(getAllRedacaoLivreResponse),
        400: schemaValidationError,
        403: genericError,
        500: genericError,
      },
      summary: 'Recupera todas as redações livres do aluno.',
    },
  },
  get: {
    preHandler: authMiddleware,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      params: idValidation,
      response: {
        200: getRedacaoLivreResponse,
        400: schemaValidationError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Recupera uma redação livre específica.',
    },
  },
  update: {
    preHandler: authMiddleware,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      params: idValidation,
      body: updateRedacaoLivreBodyValidation,
      response: {
        200: z.void(),
        400: schemaValidationError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Salva o progresso ou finaliza a redação livre.',
    },
  },
  delete: {
    preHandler: authMiddleware,
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
      summary: 'Exclui uma redação livre.',
    },
  },
  corrigir: {
    preHandler: authMiddleware,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      params: idValidation,
      body: corrigirRedacaoBodyValidation,
      response: {
        200: z.void(),
        403: genericError,
        404: genericError,
        409: genericError,
        500: genericError,
      },
      summary: 'Encaminha a redação especificada para a correção com IA.',
    },
  },
  listenCorrecao: {
    preHandler: sseAuthMiddleware,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      params: idValidation,
      summary: 'Escuta por um evento de correção da redação especificada.',
    },
  },
  deleteCorrecao: {
    preHandler: authMiddleware,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      params: z.object({
        id: idValidation.shape.id,
        correcaoId: idValidation.shape.id,
      }),
      response: {
        204: z.void(),
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Exclui uma correção de IA de uma redação livre.',
    },
  },
  retryCorrecao: {
    preHandler: authMiddleware,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      params: z.object({
        id: idValidation.shape.id,
        correcaoId: idValidation.shape.id,
      }),
      response: {
        204: z.void(),
        403: genericError,
        404: genericError,
        409: genericError,
        500: genericError,
      },
      summary: 'Tenta novamente uma correção de redação que falhou.',
    },
  },
};
