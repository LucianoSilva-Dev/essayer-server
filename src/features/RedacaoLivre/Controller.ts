import { CorrigirRedacaoQueue } from '../../shared/CorrecaoRedacaoIA/Queue';
import { AppEventEmitter } from '../../shared/Events/Emitter';
import type { RedacaoIACorrigidaEventPayload } from '../../shared/Events/Types';
import type { Controller, RequestUserData } from '../../shared/Types';
import { registerCorrecaoIAListener, streamCorrecaoRedacaoIA } from './EventListeners';
import { RedacaoLivreModel } from './Model';
import { RedacaoLivreService } from './Service';
import type { CreateRedacaoLivreBody, UpdateRedacaoLivreBody } from './Types';

AppEventEmitter.on('redacao:ia:corrigida', registerCorrecaoIAListener)

export const RedacaoLivreController: Controller = {
  create: async (request, reply) => {
    const { tema } = request.body as CreateRedacaoLivreBody;
    const { id } = request.user as RequestUserData;

    const response = await RedacaoLivreService.create(tema, id);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(201).send();
  },
  getAll: async (request, reply) => {
    const { id } = request.user as RequestUserData;

    const response = await RedacaoLivreService.getAll(id);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send(response.data);
  },
  corrigir: async (request, reply) => {
    const { id: alunoId } = request.user as RequestUserData;
    const { id: redacaoLivreId } = request.params as { id: string };

    const redacao = await RedacaoLivreModel.findById(redacaoLivreId)
    if(!redacao) {
      return reply.status(404).send({message: 'Redação não encontrada.'})
    }

    if (redacao.aluno.toString() !== alunoId) {
      return reply.status(403).send({message: 'Você não pode corrigir redações de outras pessoas, bobinho.'})
    }

    CorrigirRedacaoQueue.add('corrigirRedacao', {
      redacaoLivreId, 
      tema: redacao.tema,
      usuario: alunoId,
      texto: redacao.texto ?? ''
    })

    reply.status(200).send()
  },
  listenCorrecao: async (request, reply) => {
    const { id: alunoId } = request.user as RequestUserData;
    const { id: redacaoLivreId } = request.params as { id: string };

    const redacao = await RedacaoLivreModel.findById(redacaoLivreId)
    if(!redacao) {
      return reply.sse({
        event: 'error',
        data: JSON.stringify({
          code: 404,
          message: 'Redação não encontrada',
        }),
      });
    }

    if (redacao.aluno.toString() !== alunoId) {
      return reply.sse({
        event: 'error',
        data: JSON.stringify({
          code: 403,
          message: 'Você não pode ver correções dos amiguinhos',
        }),
      });
    }

    const wrapper = (payload: RedacaoIACorrigidaEventPayload) => {
      return streamCorrecaoRedacaoIA(payload, redacaoLivreId, reply)
    }

    AppEventEmitter.on('redacao:ia:corrigida', wrapper)

  },
  get: async (request, reply) => {
    const { id } = request.params as {id: string};
    const { id: requisitante } = request.user as RequestUserData;

    const response = await RedacaoLivreService.get(id, requisitante);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send(response.data);
  },
  update: async (request, reply) => {
    const { id } = request.params as {id: string};
    const { id: requisitante } = request.user as RequestUserData;
    const body = request.body as UpdateRedacaoLivreBody

    const response = await RedacaoLivreService.update(id, body, requisitante);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send();
  },
  delete: async (request, reply) => {
    const { id } = request.params as {id: string};
    const { id: requisitante } = request.user as RequestUserData;

    const response = await RedacaoLivreService.delete(id, requisitante);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(204).send();
  },
};
