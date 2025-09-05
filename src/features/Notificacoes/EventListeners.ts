import type { FastifyReply } from 'fastify';
import type {
  TarefaCorrigidaEventPayload,
  TarefaEnviadaEventPayload,
  TarefaFechadaEventPayload,
} from '../../shared/Events/Types';
import {
  NotificacaoTarefaCorrigidaModel,
  NotificacaoTarefaEnviadaModel,
  NotificacaoTarefaFechadaModel,
} from './Models/NotificacaoModel';
import type {
  GetAllNotificacaoTarefaCorrigidaDoc,
  GetAllNotificacaoTarefaEnviadaDoc,
  GetAllNotificacaoTarefaFechadaDoc,
} from './Types';

import { TiposNotificacao } from './Types';

// ---- Eventos que registram as notificações no banco de dados ----
export async function createNotificacaoTarefaEnviadaListener(
  payload: TarefaEnviadaEventPayload,
) {
  const notificacaoTarefEnviada = await NotificacaoTarefaEnviadaModel.create({
    tipoNotificacao: TiposNotificacao.TarefaEnviada,
    atividade: payload.atividade._id,
    remetentes: payload.remetentes,
    data: Date.now(),
    lidoPor: [],
  });

  if (!notificacaoTarefEnviada) {
    console.error(
      'Erro: Não foi possivel criar a notificação de tarefa enviada',
    );
  }
}

export async function createNotificacaoTarefaFechadaListener(
  payload: TarefaFechadaEventPayload,
) {
  const notificacaoTarefFechada = await NotificacaoTarefaFechadaModel.create({
    tipoNotificacao: TiposNotificacao.TarefaFechada,
    atividade: payload.atividade._id,
    remetentes: payload.remetentes,
    data: Date.now(),
    lidoPor: [],
  });

  if (!notificacaoTarefFechada) {
    console.error(
      'Erro: Não foi possivel criar a notificação de tarefa fechada',
    );
  }
}

export async function createNotificacaoTarefaCorrigidaListener(
  payload: TarefaCorrigidaEventPayload,
) {
  const notificacaoTarefCorrigida =
    await NotificacaoTarefaCorrigidaModel.create({
      tipoNotificacao: TiposNotificacao.TarefaCorrigida,
      atividade: payload.atividade._id,
      remetentes: payload.remetentes,
      data: Date.now(),
      lidoPor: [],
    });

  if (!notificacaoTarefCorrigida) {
    console.error(
      'Erro: Não foi possivel criar a notificação de tarefa corrigida',
    );
  }
}
// ---- Eventos que registram as notificações no banco de dados ----

// ---- Eventos que enviam notificacoes ao frontend ----

export async function streamNotificacaoTarefaEnviadaListener(
  payload: TarefaEnviadaEventPayload,
  reply: FastifyReply,
) {
  const notificacao: GetAllNotificacaoTarefaEnviadaDoc = {
    tipoNotificacao: TiposNotificacao.TarefaEnviada,
    tipoAtividade: payload.atividade.tipoAtividade,
    lido: false,
    tarefaId: payload.atividade._id.toString(),
  };

  reply.sse(
    (async function* () {
      yield {
        event: TiposNotificacao.TarefaEnviada,
        data: JSON.stringify(notificacao),
      };
    })(),
  );
}

export async function streamNotificacaoTarefaFechadaListener(
  payload: TarefaFechadaEventPayload,
  reply: FastifyReply,
) {
  const notificacao: GetAllNotificacaoTarefaFechadaDoc = {
    tipoNotificacao: TiposNotificacao.TarefaFechada,
    tipoAtividade: payload.atividade.tipoAtividade,
    lido: false,
    tarefaId: payload.atividade._id.toString(),
  };

  reply.sse(
    (async function* () {
      yield {
        event: TiposNotificacao.TarefaFechada,
        data: JSON.stringify(notificacao),
      };
    })(),
  );
}

export async function streamNotificacaoTarefaCorrigidaListener(
  payload: TarefaCorrigidaEventPayload,
  reply: FastifyReply,
) {
  const notificacao: GetAllNotificacaoTarefaCorrigidaDoc = {
    tipoNotificacao: TiposNotificacao.TarefaCorrigida,
    tipoAtividade: payload.atividade.tipoAtividade,
    lido: false,
    tarefaId: payload.atividade._id.toString(),
  };

  reply.sse(
    (async function* () {
      yield {
        event: TiposNotificacao.TarefaCorrigida,
        data: JSON.stringify(notificacao),
      };
    })(),
  );
}
// ---- Eventos que enviam notificacoes ao frontend ----
