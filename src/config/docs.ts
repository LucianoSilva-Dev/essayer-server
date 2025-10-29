import type { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import type { FastifySwaggerUiOptions } from '@fastify/swagger-ui';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';

export const fastifySwaggerConfig: FastifyDynamicSwaggerOptions = {
  openapi: {
    info: {
      title: 'Incita API',
      version: '1.0.0',
    },
    tags: [
      { name: 'Auth', description: 'Authentication related end-points' },
      { name: 'Repertório', description: 'Rotas relacionadas aos repertórios' },
      { name: 'Turma', description: 'Rotas relacionadas as Turmas' },
      { name: 'Atividade', description: 'Rotas relacionadas as Atividades' },
      {
        name: 'Notificações',
        description: 'Rotas relacionadas as Notificações',
      },
    ],
    components: {
      securitySchemes: {
        jwtAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token.',
        },

        accessTokenCookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description:
            'Autenticação via cookie httpOnly "accessToken" (definido automaticamente após login/refresh).',
        },
        refreshTokenCookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
          description:
            'Necessário para a rota /auth/refresh e /auth/logout (definido automaticamente após login/refresh).',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
};

export const fastifySwaggerUiConfig: FastifySwaggerUiOptions = {
  routePrefix: '/docs',
};
