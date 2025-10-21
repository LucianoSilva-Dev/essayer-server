// zod schemas for validation and response of the routes
import type { EntitySchema } from '../../shared/Types';
import { genericError, schemaValidationError } from '../../shared/Schemas';
import z from 'zod';
import {
  userLoginBodyValidation,
} from './Validations';

export const userLoginResponse = z.object({
  token: z.string(),
});

export const AuthSchema: EntitySchema = {
  login: {
    schema: {
      body: userLoginBodyValidation,
      response: {
        200: userLoginResponse,
        400: schemaValidationError,
        401: genericError,
      },
      summary: 'Faz o login de um usuario, usando email e senha.',
    }
  },
};
