// zod schemas for validation and response of the routes
import type { EntitySchema } from '../../shared/Types';
import { genericError, schemaValidationError } from '../../shared/Schemas';
import z from 'zod';
import { idValidation } from '../../shared/Validations';

import { createBackgroundBodyValidation } from './Validations';

export const getBackgroundResponse = z.object({
  id: z.string(),
  content: z.string(),
  author: z.string(),
  creator: z.object({
    name: z.string(),
  }),
});

export const createBackgroundResponse = z.object({
  message: z.string(),
});

export const BackgroundSchema: EntitySchema = {
  get_all: {
    schema: {
      response: {
        200: getBackgroundResponse.array(),
      },
      summary: 'Get all backgrounds.',
    },
  },

  get: {
    schema: {
      params: idValidation,
      response: {
        200: getBackgroundResponse,
        404: genericError,
      },
      summary: 'Get a background by id.',
    },
  },

  create: {
    schema: {
      body: createBackgroundBodyValidation,
      response: {
        201: createBackgroundResponse,
        400: schemaValidationError,
      },
      summary: 'Create a new background.',
    },
  },
};
