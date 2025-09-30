import type { FastifyReply } from 'fastify';
import type {
  RedacaoComAtrasoEventPayload,
  RedacaoIACorrigidaEventPayload,
  RedacaoIAPersistidaEventPayload,
} from '../../shared/Events/Types';
import { RedacaoLivreModel } from './Model';
import type { GetCorrecaoRedacaoResponse } from './Types';
import { CorrecaoRedacaoEvents } from './Types';
import { AppEventEmitter } from '../../shared/Events/Emitter';
import { getCorrecaoRedacaoResponse } from './Validations';
import { EnumCorrecaoRedacaoStatus } from '../../shared/CorrecaoRedacaoIA/Types';

export async function registerCorrecaoIAListener(
  payload: RedacaoIACorrigidaEventPayload,
) {
  // 1. Encontra o documento pai
  const redacaoLivre = await RedacaoLivreModel.findOne({
    _id: payload.redacaoLivreId,
  });
  if (!redacaoLivre) throw new Error('Redação livre não foi encontrada.');

  const correcao = redacaoLivre.correcoesIA.id(payload.correcaoId);
  if (!correcao) throw new Error('Correção não foi encontrada.');

  correcao.set({
    ...payload.correcao,
    status: EnumCorrecaoRedacaoStatus.Finalizada,
  });

  await redacaoLivre.save();

  const correcaoObj = correcao.toObject();
  const correcaoResponse = getCorrecaoRedacaoResponse.parse({
    ...correcaoObj,
    id: correcaoObj._id.toString(),
  });

  AppEventEmitter.emit('redacao:ia:persistida', {
    redacaoLivreId: payload.redacaoLivreId,
    remetente: payload.remetente,
    correcao: correcaoResponse,
  });
}

export async function streamCorrecaoRedacaoIA(
  payload: RedacaoIAPersistidaEventPayload,
  redacaoId: string,
  reply: FastifyReply,
) {
  if (payload.redacaoLivreId !== redacaoId) return;

  const redacaoLivre = await RedacaoLivreModel.findById(
    payload.redacaoLivreId,
  ).lean();

  if (!redacaoLivre) {
    return reply.sse({
      event: 'error',
      data: JSON.stringify({
        statusCode: 404,
        message: 'Redação não encontrada',
      }),
    });
  }

  if (redacaoLivre.aluno.toString() !== payload.remetente) {
    return reply.sse({
      event: 'error',
      data: JSON.stringify({
        statusCode: 403,
        message: 'Essa redação não é sua',
      }),
    });
  }

  const correcaoResponse: GetCorrecaoRedacaoResponse = {
    ...payload.correcao,
  };

  reply.sse({
    event: CorrecaoRedacaoEvents.RedacaoCorrigida,
    data: JSON.stringify(correcaoResponse),
  });
}

export async function streamCorrecaoRedacaoIADelay(
  payload: RedacaoComAtrasoEventPayload,
  redacaoId: string,
  reply: FastifyReply,
) {
  if (payload.redacaoLivreId !== redacaoId) return;

  const redacaoLivre = await RedacaoLivreModel.findById(
    payload.redacaoLivreId,
  ).lean();
  if (!redacaoLivre) {
    return reply.sse({
      event: 'error',
      data: JSON.stringify({
        statusCode: 404,
        message: 'Redação não encontrada',
      }),
    });
  }

  if (redacaoLivre.aluno.toString() !== payload.remetente) {
    return reply.sse({
      event: 'error',
      data: JSON.stringify({
        statusCode: 403,
        message: 'Essa redação não é sua',
      }),
    });
  }

  reply.sse({
    event: CorrecaoRedacaoEvents.RedacaoDevagaar,
    data: 'espera sentado',
  });
}
