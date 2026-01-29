import type {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * OpenAPI schema for validation errors.
 * Used when request body fails Zod validation.
 */
export const validationErrorSchema: SchemaObject & Partial<ReferenceObject> = {
  type: 'object',
  properties: {
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['validation'] },
          message: { type: 'string', example: 'The field name is required' },
          field: {
            type: 'string',
            example: 'lessons.0.lessonName',
            description: 'Path to the field with error (dot-separated)',
          },
        },
      },
    },
  },
};

/**
 * OpenAPI schema for business logic errors.
 * Used when a business rule is violated (e.g., unauthorized access).
 */
export const businessLogicErrorSchema: SchemaObject & Partial<ReferenceObject> = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['business_logic'] },
        message: {
          type: 'string',
          example: 'You need to be an admin to access this route',
        },
      },
    },
  },
};

/**
 * OpenAPI schema for unknown/internal errors.
 * Used for unexpected server errors.
 */
export const unknownErrorSchema: SchemaObject & Partial<ReferenceObject> = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['unknown'] },
        message: { type: 'string', example: 'Internal Server Error' },
      },
    },
  },
};
