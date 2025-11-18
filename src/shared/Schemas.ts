import z from 'zod';

export const genericError = z.object({
    error: z.string(),
});

export const schemaValidationError = z.object({
    errors: z.string().array(),
});

export const sseGenericError = z.object({
    event: z.literal('appError'),
    data: z.object({
        statusCode: z.number(),
        message: z.string()
    })
})

export const sseValidationError = z.object({
    event: z.literal('error'),
    data: z.object({
        statusCode: z.literal(400),
        errors: z.string().array()
    })
})
