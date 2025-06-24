import type { FastifyCorsOptions } from "@fastify/cors";

export const corsConfig: FastifyCorsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  optionsSuccessStatus: 204,
  preflightContinue: false,
  allowedHeaders: [
    'content-type',
    'accept',
    'content-type',
    'authorization'
  ],
};