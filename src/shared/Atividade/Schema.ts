import { z } from 'zod';
import { authProfessor } from '../middlewares/Authorization';
import type { EntitySchema } from '../Types';
import { idValidation } from '../Validations';
import { genericError, schemaValidationError } from '../Schemas';

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
};
