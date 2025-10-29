import type { FastifyCorsOptions } from '@fastify/cors';

export const corsConfig: FastifyCorsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://[::1]:3001',
    'https://incita.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 204,
  preflightContinue: false,
  allowedHeaders: [
    'content-type',
    'accept',
    'authorization',
    'cache-control',
    'expires',
    'pragma',
  ],
};
