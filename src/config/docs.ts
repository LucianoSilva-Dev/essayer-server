import { jsonSchemaTransform } from "fastify-type-provider-zod";
import type { FastifyDynamicSwaggerOptions } from "@fastify/swagger";
import type { FastifySwaggerUiOptions } from "@fastify/swagger-ui";

export const fastifySwaggerConfig: FastifyDynamicSwaggerOptions = {
  openapi: {
    info: {
      title: 'Incita API',
      version: '1.0.0',
    },
    tags: [
      { name: 'Auth', description: 'Authentication related end-points' },
      { name: 'Background', description: 'Background related end-points' },
    ],
    components: {
      securitySchemes: {
        jwtAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token.',
        },
      },
      
    }
  },
  transform: jsonSchemaTransform
}

export const fastifySwaggerUiConfig: FastifySwaggerUiOptions = {
  routePrefix: '/docs',
}