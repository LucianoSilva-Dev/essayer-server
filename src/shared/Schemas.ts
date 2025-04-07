import z from 'zod';

export const genericError = z.object({
    error: z.string(),
});

export const schemaValidationError = z.object({
    errors: z.string().array(),
});


