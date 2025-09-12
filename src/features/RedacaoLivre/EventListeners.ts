import type { FastifyReply } from 'fastify';
import type { RedacaoIACorrigidaEventPayload } from '../../shared/Events/Types';
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

  const correcaoResponse: CorrecaoRedacaoIAResponse = {
    ...payload.correcao,
  };

  reply.sse(
    (async function* () {
      yield {
        event: CorrecaoRedacaoEvents.RedacaoCorrigida,
        data: JSON.stringify(correcaoResponse),
      };
    })(),
  );
}
