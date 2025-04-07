// zod schemas for validation and response of the routes
import type { EntitySchema } from '../../shared/Types';
import { genericError, schemaValidationError } from '../../shared/Schemas';
import z from 'zod';
import {
  postRegisterAuthBodyValidation,
  getTokenAuthBodyValidation,
} from './Validations';

export const tokenResponse = z.object({
  token: z.string(),
});

export const userRegisterResponse = z.object({
  message: z.string(),
});

export const AuthSchema: EntitySchema = {
  getToken: {
    schema: {
      body: getTokenAuthBodyValidation,
      response: {
        200: tokenResponse,
        400: schemaValidationError,
        401: genericError,
      },
      summary: 'Get the JWT token',
    }
  },

  register: {
    schema: {
      body: postRegisterAuthBodyValidation,
      response: {
        201: userRegisterResponse,
        400: schemaValidationError,
        404: genericError,
      },
      summary: 'Register a new user',
    }
  },
};
