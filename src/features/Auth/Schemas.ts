// zod schemas for validation and response of the routes
import type { EntitySchema } from '../../shared/Types';
import { genericError, schemaValidationError } from '../../shared/Schemas';
import z from 'zod';
import {
  userLoginBodyValidation,
  userRegisterBodyValidation,
} from './Validations';

export const userLoginResponse = z.object({
  token: z.string(),
});

export const userRegisterResponse = z.object({
  message: z.string(),
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
      summary: 'Login a user with email and password',
    }
  },

  register: {
    schema: {
      body: userRegisterBodyValidation,
      response: {
        201: userRegisterResponse,
        400: schemaValidationError,
        409: genericError,
      },
      summary: 'Register a new user with email, name and password',
    }
  },
};
