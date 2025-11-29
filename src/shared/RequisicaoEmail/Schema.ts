import { authMiddleware } from '../middlewares/Authentication';
import { genericError, schemaValidationError } from '../Schemas';
import type { EntitySchema } from '../Types';
import { genericSuccessResponse, idValidation } from '../Validations';
import { createRequisicaoEmailBodyValidation, createRequisicaoEmailResponse, validateRequisicaoEmailBodyValidation } from './Validation';


export const RequisicaoEmailSchema: EntitySchema = {
  validate: {
    preHandler: authMiddleware,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      params: idValidation,
      body: validateRequisicaoEmailBodyValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        404: genericError,
        422: genericError,
        500: genericError,
      },
      summary: 'Valida o código enviado por e-mail para o usuário.',
    },
  },
  create: {
    preHandler: authMiddleware,
    schema: {
      security: [{ accessTokenCookieAuth: [] }],
      body: createRequisicaoEmailBodyValidation,
      response: {
        200: createRequisicaoEmailResponse,
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        404: genericError,
        409: genericError,
        500: genericError,
      },
      summary: 'Cria requisição de mudança de email.',
    },
  },
};
