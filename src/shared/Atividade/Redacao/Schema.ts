import { z } from 'zod';
import { authMiddleware } from '../../middlewares/Authentication';
import { authProfessor, authProfessorCreate } from '../../middlewares/Authorization';
import { genericError, schemaValidationError } from '../../Schemas';
import type { EntitySchema } from '../../Types';
import {
  createRedacaoBodyValidation,
  enviarRedacaoBodyValidation,
  feedbackRedacaoBodyValidation,
  getAllRespostasRedacaoQueryValidation,
  getAllRespostasRedacaoResponse,
  getRedacaoResponse,
  updateRedacaoBodyValidation,
} from './Validations';
import { genericSuccessResponse, idValidation } from '../../Validations';

export const RedacaoSchema: EntitySchema = {
  create: {
    preHandler: authProfessorCreate,
    schema: {
      security: [{ jwtAuth: [] }],
      body: createRedacaoBodyValidation,
      response: {
        201: z.void(),
        400: schemaValidationError,
        403: genericError,
        500: genericError,
      },
      summary: 'Cria uma nova atividade do tipo especificado.',
    },
  },
  get: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      response: {
        200: getRedacaoResponse,
        400: schemaValidationError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Obtém detalhes de uma atividade do tipo especificado.',
    },
  },
  update: {
    preHandler: authProfessorCreate,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      body: updateRedacaoBodyValidation,
      response: {
        200: z.void(),
        400: schemaValidationError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Atualiza uma atividade.',
    },
  },
  start: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      response: {
        200: z.void(),
        400: schemaValidationError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Inicia a resposta de uma redação.',
    },
  },
  send: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      body: enviarRedacaoBodyValidation,
      response: {
        200: z.void(),
        400: schemaValidationError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Envia a resposta da redação.',
    },
  },
  feedback: {
    preHandler: authProfessor,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      body: feedbackRedacaoBodyValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Adiciona ou atualiza o feedback de uma resposta.',
    },
  },
  getAllRespostasRedacao: {
    preHandler: authProfessor,
    schema: {
      security: [{jwtAuth: []}],
      params: idValidation,
      querystring: getAllRespostasRedacaoQueryValidation,
      response: {
        200: getAllRespostasRedacaoResponse,
        400: schemaValidationError,
        403: genericError,
        404: genericError,
        500: genericError
      },
      summary: "Resgata todas as respostas de uma atividade."
    }
  }
};
