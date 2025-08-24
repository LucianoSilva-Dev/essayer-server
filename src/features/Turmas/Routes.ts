import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { authPlugin } from '../../shared/plugins/auth';
import { AddEntityWiseTags } from '../../shared/Utils';
import { TurmaController } from './Controller';
import { TurmaSchema } from './Schema';

export const TurmaRoutes: FastifyPluginAsyncZod = async (app) => {
  AddEntityWiseTags(app, ['Turma']);
  app.register(authPlugin);

  // Turma
  app.post('/', TurmaSchema.create, TurmaController.create);
  app.get('/', TurmaSchema.getAll, TurmaController.getAll);
  app.get('/criadas', TurmaSchema.getCriadas, TurmaController.getCriadas);
  app.get('/:id', TurmaSchema.getById, TurmaController.getById);
  app.put('/:id', TurmaSchema.update, TurmaController.update);
  app.delete('/:id', TurmaSchema.delete, TurmaController.delete);
  app.get('/:id/atividades', TurmaSchema.getAllAtividades, TurmaController.getAllAtividades);
  
  // Codigo Convite
  app.get('/:id/convite', TurmaSchema.getCodigoConvite, TurmaController.getCodigoConvite);
  app.post('/:id/regenerar-codigo', TurmaSchema.regenerarCodigoConvite, TurmaController.regenerarCodigoConvite);

  // Membros
  app.post('/solicitar-entrada', TurmaSchema.solicitarEntrada, TurmaController.solicitarEntrada);
  app.get('/:id/pedidos', TurmaSchema.getPedidos, TurmaController.getPedidos);
  app.post('/:id/pedidos/:alunoId/aprovar', TurmaSchema.aprovarPedido, TurmaController.aprovarPedido);
  app.delete('/:id/pedidos/:alunoId/recusar', TurmaSchema.recusarPedido, TurmaController.recusarPedido);
  app.get('/:id/alunos', TurmaSchema.getAllAlunos, TurmaController.getAllAlunos);
  app.delete('/:id/alunos/:alunoId', TurmaSchema.removerAluno, TurmaController.removerAluno);
};