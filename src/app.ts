import fastify, { type FastifyInstance } from 'fastify';
import {
  validatorCompiler,
  serializerCompiler,
} from 'fastify-type-provider-zod';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { corsConfig } from './config/cors';
import { fastifySwaggerConfig, fastifySwaggerUiConfig } from './config/docs';
import { fastifyMultipartConfig } from './config/multipart';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';

import { appErrorHandler } from './shared/plugins/appErrorHandler';

import { AuthRoutes } from './features/Auth/Routes';
import { BackgroundRoutes } from './features/Background/Routes';
import { appConfig } from './config/app';
import { RequisicaoProfessorRoutes, UsuarioRoutes } from './shared/Routes';

class App {
  readonly app: FastifyInstance;

  constructor() {
    this.app = fastify(appConfig).withTypeProvider<ZodTypeProvider>();
    this.compilers();
    this.plugins();
    this.routes();
  }

  private compilers() {
    this.app.setValidatorCompiler(validatorCompiler);
    this.app.setSerializerCompiler(serializerCompiler);
  }

  private plugins() {
    this.app.register(fastifyCors, corsConfig);
    this.app.register(fastifySwagger, fastifySwaggerConfig);
    this.app.register(fastifySwaggerUi, fastifySwaggerUiConfig);
    this.app.register(fastifyMultipart, fastifyMultipartConfig);
    this.app.setErrorHandler(appErrorHandler);
  }

  private routes() {
    this.app.register(AuthRoutes, { prefix: '/auth' });
    this.app.register(BackgroundRoutes, { prefix: '/background' });
    this.app.register(UsuarioRoutes, { prefix: '/usuario' });
    this.app.register(RequisicaoProfessorRoutes, {
      prefix: '/requisicao-professor',
    });
  }
}

export default new App().app;
