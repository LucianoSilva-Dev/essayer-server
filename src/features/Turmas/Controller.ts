import type { Controller, RequestUserData } from '../../shared/Types';
import { TurmaService } from './Service';
import type { CreateTurmaBody, UpdateTurmaBody, SolicitarEntradaBody } from './Types';

export const TurmaController: Controller = {
  create: async (request, reply) => {
    const { id: userId } = request.user as RequestUserData;
    const response = await TurmaService.create(request.body as CreateTurmaBody, userId);
    if (!response.success) {
      return reply.status(response.status).send({ error: response.message });
    }
    
    reply.status(201).send();

    
  },

  getAll: async (request, reply) => {
    const { id: userId } = request.user as RequestUserData;
    const response = await TurmaService.getAll(userId);

    reply.status(200).send(response.data)
  },

  getCriadas: async (request, reply) => {
    const { id: userId } = request.user as RequestUserData;
    const response = await TurmaService.getCriadas(userId);
   
    reply.status(200).send(response.data);
  },
  
  getById: async (request, reply) => {
    const { id: turmaId } = request.params as { id: string };
    const { id: userId } = request.user as RequestUserData;
    const response = await TurmaService.getById(turmaId, userId);
    if (!response.success) {
      return reply.status(response.status).send({ error: response.message });
    }
    reply.status(200).send(response.data);
  },

  update: async (request, reply) => {
    const { id: turmaId } = request.params as { id: string };
    const { id: userId } = request.user as RequestUserData;
    const response = await TurmaService.update(turmaId, request.body as UpdateTurmaBody, userId);
    if (!response.success) {
      return reply.status(response.status).send({ error: response.message });
    }
    reply.status(204).send();
  },

  delete: async (request, reply) => {
    const { id: turmaId } = request.params as { id: string };
    const { id: userId } = request.user as RequestUserData;
    const response = await TurmaService.delete(turmaId, userId);
    if (!response.success) {
      return reply.status(response.status).send({ error: response.message });
    }
    reply.status(204).send();
  },
  
  solicitarEntrada: async (request, reply) => {
    const { codigoConvite } = request.body as SolicitarEntradaBody;
    const { id: alunoId } = request.user as RequestUserData;
    const response = await TurmaService.solicitarEntrada(codigoConvite, alunoId);
    if (!response.success) {
        return reply.status(response.status).send({ error: response.message });
    }
    reply.status(200).send();
  },
  
  getPedidos: async (request, reply) => {
    const { id: turmaId } = request.params as { id: string };
    const { id: userId } = request.user as RequestUserData;
    const response = await TurmaService.getPedidos(turmaId, userId);
    if (!response.success) {
        return reply.status(response.status).send({ error: response.message });
    }
    reply.send(response.data);
  },
  
  aprovarPedido: async (request, reply) => {
    const { id: turmaId, alunoId } = request.params as { id: string; alunoId: string };
    const { id: userId } = request.user as RequestUserData;
    const response = await TurmaService.aprovarPedido(turmaId, alunoId, userId);
    if (!response.success) {
        return reply.status(response.status).send({ error: response.message });
    }
    reply.status(200).send();
  },
  
  recusarPedido: async (request, reply) => {
    const { id: turmaId, alunoId } = request.params as { id: string; alunoId: string };
    const { id: userId } = request.user as RequestUserData;
    const response = await TurmaService.recusarPedido(turmaId, alunoId, userId);
    if (!response.success) {
        return reply.status(response.status).send({ error: response.message });
    }
    reply.status(204).send();
  },

  getAllAlunos: async (request, reply) => {
    const { id: turmaId } = request.params as { id: string };
    const { id: userId } = request.user as RequestUserData;
    const response = await TurmaService.getAllAlunos(turmaId, userId);
    if (!response.success) {
        return reply.status(response.status).send({ error: response.message });
    }
    reply.send(response.data);
  },

  getCodigoConvite: async (request, reply) => {
    const { id: turmaId } = request.params as { id: string };
    const { id: userId } = request.user as RequestUserData;
    const response = await TurmaService.getCodigoConvite(turmaId, userId);
    if (!response.success) {
        return reply.status(response.status).send({ error: response.message });
    }
    reply.send(response.data);
  },

  regenerarCodigoConvite: async (request, reply) => {
    const { id: turmaId } = request.params as { id: string };
    const { id: userId } = request.user as RequestUserData;
    const response = await TurmaService.regenerarCodigoConvite(turmaId, userId);
    if (!response.success) {
        return reply.status(response.status).send({ error: response.message });
    }
    reply.send(response.data);
  },

  getAllAtividades: async (request, reply) => {
    const { id: turmaId } = request.params as { id: string };
    const { id: userId } = request.user as RequestUserData;
    const response = await TurmaService.getAllAtividades(turmaId, userId);
    if (!response.success) {
        return reply.status(response.status).send({ error: response.message });
    }
    reply.send(response.data);
  },
  
  removerAluno: async (request, reply) => {
    const { id: turmaId, alunoId } = request.params as { id: string; alunoId: string };
    const { id: userId } = request.user as RequestUserData;
    const response = await TurmaService.removerAluno(turmaId, alunoId, userId);
     if (!response.success) {
        return reply.status(response.status).send({ error: response.message });
    }
    reply.status(204).send();
  }
};