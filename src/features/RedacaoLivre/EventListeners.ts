import type { FastifyReply } from 'fastify';
import type { RedacaoComAtrasoEventPayload, RedacaoIACorrigidaEventPayload } from '../../shared/Events/Types';
import { RedacaoLivreModel } from './Model';
import type { CorrecaoRedacaoIAResponse } from '../../shared/CorrecaoRedacaoIA/Types';
import { CorrecaoRedacaoEvents } from './Types';

export async function registerCorrecaoIAListener(
  payload: RedacaoIACorrigidaEventPayload,
) {
  await RedacaoLivreModel.findByIdAndUpdate(payload.redacaoLivreId, {
    $push: {
      correcoesIA: payload.correcao,
    },
  });
}

export async function streamCorrecaoRedacaoIA(
  payload: RedacaoIACorrigidaEventPayload,
  redacaoId: string,
  reply: FastifyReply,
) {
  if (payload.redacaoLivreId !== redacaoId) return

  const redacaoLivre = await RedacaoLivreModel.findById(payload.redacaoLivreId).lean()
  if (!redacaoLivre) {
    return reply.sse({
      event: 'error',
      data: JSON.stringify({
        statusCode: 404,
        message: 'Redação não encontrada'
      })
    })
  }

  if (redacaoLivre.aluno.toString() !== payload.remetente) {
    return reply.sse({
      event: 'error',
      data: JSON.stringify({
        statusCode: 403,
        message: 'Essa redação não é sua'
      })
    })
  }

  const correcaoResponse: CorrecaoRedacaoIAResponse = {
    ...payload.correcao,
  };

  reply.sse({
    event: CorrecaoRedacaoEvents.RedacaoCorrigida,
    data: JSON.stringify(correcaoResponse),
  }
  );
}

export async function streamCorrecaoRedacaoIADelay(
  payload: RedacaoComAtrasoEventPayload,
  redacaoId: string,
  reply: FastifyReply,
) {

  if (payload.redacaoLivreId !== redacaoId) return

  const redacaoLivre = await RedacaoLivreModel.findById(payload.redacaoLivreId).lean()
  if (!redacaoLivre) {
    return reply.sse({
      event: 'error',
      data: JSON.stringify({
        statusCode: 404,
        message: 'Redação não encontrada'
      })
    })
  }

  if (redacaoLivre.aluno.toString() !== payload.remetente) {
    return reply.sse({
      event: 'error',
      data: JSON.stringify({
        statusCode: 403,
        message: 'Essa redação não é sua'
      })
    })
  }

  reply.sse({
    event: CorrecaoRedacaoEvents.RedacaoDevagaar,
    data: 'espera sentado'
  }
  );
}
