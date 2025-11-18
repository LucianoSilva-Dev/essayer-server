import { CorrigirRedacaoQueue } from '../../shared/CorrecaoRedacaoIA/Queue';
import { EnumCorrecaoRedacaoStatus } from '../../shared/CorrecaoRedacaoIA/Types';
import { AppEventEmitter } from '../../shared/Events/Emitter';
import type {
  RedacaoComAtrasoEventPayload,
  RedacaoIAPersistidaEventPayload,
} from '../../shared/Events/Types';
import type { Controller, RequestUserData } from '../../shared/Types';
import {
  registerCorrecaoIAListener,
  streamCorrecaoRedacaoIA,
  streamCorrecaoRedacaoIADelay,
} from './EventListeners';
import { RedacaoLivreModel } from './Model';
import { RedacaoLivreService } from './Service';
import type {
  CorrigirRedacaoBody,
  CreateRedacaoLivreBody,
  UpdateRedacaoLivreBody,
} from './Types';

AppEventEmitter.on('redacao:ia:corrigida', registerCorrecaoIAListener);

export const RedacaoLivreController: Controller = {
  create: async (request, reply) => {
    const body = request.body as CreateRedacaoLivreBody;
    const { id } = request.user as RequestUserData;

    const response = await RedacaoLivreService.create(body, id);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(201).send(response.data);
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
  get: async (request, reply) => {
    const { id } = request.params as { id: string };
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
    const { id } = request.params as { id: string };
    const { id: requisitante } = request.user as RequestUserData;
    const body = request.body as UpdateRedacaoLivreBody;

    const response = await RedacaoLivreService.update(id, body, requisitante);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send();
  },
  delete: async (request, reply) => {
    const { id } = request.params as { id: string };
    const { id: requisitante } = request.user as RequestUserData;

    const response = await RedacaoLivreService.delete(id, requisitante);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(204).send();
  },
  corrigir: async (request, reply) => {
    const { id: alunoId } = request.user as RequestUserData;
    const { id: redacaoLivreId } = request.params as { id: string };
    const { tema, textoRedacao } = request.body as CorrigirRedacaoBody;

    const redacao = await RedacaoLivreModel.findById(redacaoLivreId);
    if (!redacao) {
      return reply.status(404).send({ error: 'Redação não encontrada.' });
    }

    if (redacao.aluno.toString() !== alunoId) {
      return reply.status(403).send({
        error: 'Você não pode corrigir redações de outras pessoas, bobinho.',
      });
    }

    const job = await CorrigirRedacaoQueue.getJob(redacaoLivreId);
    const jobState = await job?.getState();

    if (jobState !== undefined && jobState !== 'failed') {
      return reply
        .status(409)
        .send({ error: 'A correção desta redação já está em andamento.' });
    }

    const correcao = redacao.correcoesIA
      .create({
        texto: textoRedacao,
        status: EnumCorrecaoRedacaoStatus.Pendente,
      })
      .toObject();

    const correcaoId = correcao._id.toString();
    redacao.correcoesIA.push(correcao);
    await redacao.save();

    CorrigirRedacaoQueue.add(
      'corrigirRedacao',
      {
        redacaoLivreId,
        correcaoId,
        tema,
        usuario: alunoId,
        texto: textoRedacao,
      },
      { jobId: correcaoId },
    );

    reply.status(200).send();
  },
  listenCorrecao: async (request, reply) => {
    const { id: alunoId } = request.user as RequestUserData;
    const { id: redacaoLivreId } = request.params as { id: string };
    reply.sse({ comment: '' });

    const redacao = await RedacaoLivreModel.findById(redacaoLivreId);
    if (!redacao) {
      return reply.sse({
        event: 'appError',
        data: JSON.stringify({
          code: 404,
          message: 'Redação não encontrada',
        }),
      });
    }

    if (redacao.aluno.toString() !== alunoId) {
      return reply.sse({
        event: 'appError',
        data: JSON.stringify({
          code: 403,
          message: 'Você não pode ver correções dos amiguinhos',
        }),
      });
    }

    const redacaoPersistidaWrapper = (
      payload: RedacaoIAPersistidaEventPayload,
    ) => streamCorrecaoRedacaoIA(payload, redacaoLivreId, reply);

    const redacaoDelayWrapper = (payload: RedacaoComAtrasoEventPayload) =>
      streamCorrecaoRedacaoIADelay(payload, redacaoLivreId, reply);

    AppEventEmitter.on('redacao:ia:persistida', redacaoPersistidaWrapper);
    AppEventEmitter.on('redacao:ia:delay', redacaoDelayWrapper);

    request.raw.on('close', () => {
      AppEventEmitter.off('redacao:ia:persistida', redacaoPersistidaWrapper);
      AppEventEmitter.off('redacao:ia:delay', redacaoDelayWrapper);
      reply.sseContext.source.end();
    });
  },
  deleteCorrecao: async (request, reply) => {
    const { id: requisitante } = request.user as RequestUserData;
    const { id, correcaoId } = request.params as {
      id: string;
      correcaoId: string;
    };

    const response = await RedacaoLivreService.deleteCorrecao(
      id,
      correcaoId,
      requisitante,
    );
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(204).send();
  },
  retryCorrecao: async (request, reply) => {
    const { id: requisitante } = request.user as RequestUserData;
    const { id, correcaoId } = request.params as {
      id: string;
      correcaoId: string;
    };

    const response = await RedacaoLivreService.retryCorrecao(
      id,
      correcaoId,
      requisitante,
    );
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(204).send();
  },
};
