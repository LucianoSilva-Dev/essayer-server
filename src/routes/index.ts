import { UsersRoutes } from './users.routes';
import { AuthRoutes } from './auth.routes';
import { RepertorioRoutes } from './repertorio.routes';
import { RequisicaoMudancaSenhaRoutes } from './requisicao-mudanca-senha.routes';
import { RequisicaoProfessorRoutes } from './requisicao-professor.routes';
import { RequisicaoUsuarioRoutes } from './requisicao-user.routes';
import type { FastifyInstance } from 'fastify';

export default async function routes(app: FastifyInstance) {
  app.register(AuthRoutes, { prefix: '/auth' });
  app.register(UsersRoutes, { prefix: '/usuario' });
  app.register(RequisicaoProfessorRoutes, {
    prefix: '/requisicao-professor',
  });
  app.register(RepertorioRoutes, { prefix: '/repertorio' });
  app.register(RequisicaoMudancaSenhaRoutes, {
    prefix: '/requisicao-senha',
  });
  app.register(RequisicaoUsuarioRoutes, {
    prefix: '/requisicao-usuario',
  });
}
