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
import { RepertorioRoutes } from './features/Repertorios/Routes';
import { appConfig } from './config/app';
import { TurmaRoutes } from './features/Turmas/Routes';
import { AtividadeRoutes } from './shared/Atividade/Routes';
import { NotificacaoRoutes } from './features/Notificacoes/Routes';
import { RedacaoLivreRoutes } from './features/RedacaoLivre/Routes';
import FastifySSEPlugin from 'fastify-sse-v2';
import { BullBoardRoutes } from './features/BullBoard/Routes';
import { UsuarioRoutes } from './shared/Usuario/Routes';
import { RequisicaoUsuarioRoutes } from './shared/RequisicaoUsuario/Routes';
import { RequisicaoMudancaSenhaRoutes } from './shared/RequisicaoMudancaSenha/Routes';
import { RequisicaoProfessorRoutes } from './shared/RequisicaoProfessor/Routes';

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
    this.app.register(FastifySSEPlugin)
    this.app.setErrorHandler(appErrorHandler);
  }

  private routes() {
    this.app.register(AuthRoutes, { prefix: '/auth' });
    this.app.register(UsuarioRoutes, { prefix: '/usuario' });
    this.app.register(RequisicaoProfessorRoutes, {
      prefix: '/requisicao-professor',
    });
    this.app.register(RepertorioRoutes, { prefix: '/repertorio' });
    this.app.register(RequisicaoMudancaSenhaRoutes, {
      prefix: '/requisicao-senha',
    });
    this.app.register(RequisicaoUsuarioRoutes, {
      prefix: '/requisicao-usuario',
    });
    this.app.register(TurmaRoutes, { prefix: '/turma' });
    this.app.register(AtividadeRoutes, { prefix: '/atividade' });
    this.app.register(RedacaoLivreRoutes, {prefix: '/usuario/redacao'})
    this.app.register(NotificacaoRoutes, { prefix: '/notificacao' })
    this.app.register(BullBoardRoutes, { prefix: '/bull-board' });
  }
}

export default new App().app;
