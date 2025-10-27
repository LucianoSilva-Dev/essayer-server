// zod schemas for validation and response of the routes

import z from 'zod';
import { genericError, schemaValidationError } from '../../shared/Schemas';
import type { EntitySchema } from '../../shared/Types';
import { genericSuccessResponse } from '../../shared/Validations';
import { userLoginBodyValidation } from './Validations';

export const AuthSchema: EntitySchema = {
  login: {
    schema: {
      body: userLoginBodyValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        500: genericError,
      },
      summary: 'Faz o login de um usuario, usando email e senha.',
    },
  },
  refresh: {
    schema: {
      security: [{ refreshTokenCookieAuth: [] }],
      response: {
        200: genericSuccessResponse,
        401: genericError,
        500: genericError,
      },
      summary: 'Atualiza o access token usando o refresh token (via cookie)',
      description:
        'Envia o refresh token via cookie httpOnly. Retorna novos tokens via cookies httpOnly.',
    },
  },
  logout: {
    schema: {
      security: [{ refreshTokenCookieAuth: [] }],
      response: {
        204: z.void(),
        500: genericError,
      },
      summary:
        'Invalida a sessão do usuário e limpa os cookies de autenticação',
      description:
        'Utiliza o refresh token (via cookie) para invalidar a sessão no servidor.',
    },
  },
};
