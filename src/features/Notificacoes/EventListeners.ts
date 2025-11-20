import type { FastifyReply } from 'fastify';
import { AppEventEmitter } from '../../shared/Events/Emitter';
import type {
  RequisicaoProfessorStatusEventPayload,
  TarefaCorrigidaEventPayload,
  TarefaEnviadaEventPayload,
  TarefaFechadaEventPayload,
} from '../../shared/Events/Types';
import {
  NotificacaoRequisicaoProfessorStatusModel,
  NotificacaoTarefaCorrigidaModel,
  NotificacaoTarefaEnviadaModel,
  NotificacaoTarefaFechadaModel,
} from './Models/NotificacaoModel';
import type {
  GetAllNotificacaoRequisicaoProfessorStatusDoc,
  GetAllNotificacaoTarefaCorrigidaDoc,
  GetAllNotificacaoTarefaEnviadaDoc,
  GetAllNotificacaoTarefaFechadaDoc,
} from './Types';

import { TiposNotificacao } from './Types';
import type {
  NotificacaoRequisicaoProfessorStatus,
  NotificacaoTarefaCorrigida,
  NotificacaoTarefaEnviada,
  NotificacaoTarefaFechada,
} from './Types';

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
    return;
  }

  AppEventEmitter.emit(
    'notificacao:tarefa:enviada:criada',
    notificacaoTarefEnviada as unknown as NotificacaoTarefaEnviada,
  );
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
    return;
  }

  AppEventEmitter.emit(
    'notificacao:tarefa:fechada:criada',
    notificacaoTarefFechada as unknown as NotificacaoTarefaFechada,
  );
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
    return;
  }

  AppEventEmitter.emit(
    'notificacao:tarefa:corrigida:criada',
    notificacaoTarefCorrigida as unknown as NotificacaoTarefaCorrigida,
  );
}

export async function createNotificacaoRequisicaoProfessorStatusListener(
  payload: RequisicaoProfessorStatusEventPayload,
) {
  const notificacaoRequisicaoProfessorStatus = await NotificacaoRequisicaoProfessorStatusModel.create({
    tipoNotificacao: TiposNotificacao.RequisicaoProfessorStatus,
    motivo: payload.motivo,
    requisicaoId: payload.requisicaoId,
    remetentes: [payload.remetente],
    data: Date.now(),
    lidoPor: [],
  });

  console.log(notificacaoRequisicaoProfessorStatus);

  if (!notificacaoRequisicaoProfessorStatus) {
    console.error(
      'Erro: Não foi possivel criar a notificação de requisição de professor',
    );
    return;
  }

  AppEventEmitter.emit(
    'notificacao:requisicao-professor:status:criada',
    notificacaoRequisicaoProfessorStatus as unknown as NotificacaoRequisicaoProfessorStatus,
  );
}

// ---- Eventos que registram as notificações no banco de dados ----

// ---- Eventos que enviam notificacoes ao frontend ----

export async function streamNotificacaoTarefaEnviadaListener(
  payload: NotificacaoTarefaEnviada,
  userId: string,
  reply: FastifyReply,
) {
  if (
    !payload.remetentes.some((remetente) => remetente.toString() === userId)
  )
    return;

  const notificacao: GetAllNotificacaoTarefaEnviadaDoc = {
    tipoNotificacao: TiposNotificacao.TarefaEnviada,
    lido: false,
    tarefaId: payload.atividade.toString(),
    id: payload._id.toString(),
  };

  reply.sse({
    event: TiposNotificacao.TarefaEnviada,
    data: JSON.stringify(notificacao),
  });
}

export async function streamNotificacaoTarefaFechadaListener(
  payload: NotificacaoTarefaFechada,
  userId: string,
  reply: FastifyReply,
) {
  if (
    !payload.remetentes.some((remetente) => remetente.toString() === userId)
  )
    return;

  const notificacao: GetAllNotificacaoTarefaFechadaDoc = {
    tipoNotificacao: TiposNotificacao.TarefaFechada,
    lido: false,
    tarefaId: payload.atividade.toString(),
    id: payload._id.toString(),
  };

  reply.sse({
    event: TiposNotificacao.TarefaFechada,
    data: JSON.stringify(notificacao),
  });
}

export async function streamNotificacaoTarefaCorrigidaListener(
  payload: NotificacaoTarefaCorrigida,
  userId: string,
  reply: FastifyReply,
) {
  if (
    !payload.remetentes.some((remetente) => remetente.toString() === userId)
  )
    return;

  const notificacao: GetAllNotificacaoTarefaCorrigidaDoc = {
    tipoNotificacao: TiposNotificacao.TarefaCorrigida,
    lido: false,
    tarefaId: payload.atividade.toString(),
    id: payload._id.toString(),
  };

  reply.sse({
    event: TiposNotificacao.TarefaCorrigida,
    data: JSON.stringify(notificacao),
  });
}

export async function streamNotificacaoRequisicaoProfessorStatusListener(
  payload: NotificacaoRequisicaoProfessorStatus,
  userId: string,
  reply: FastifyReply,
) {
  if (
    !payload.remetentes.some((remetente) => remetente.toString() === userId)
  )
    return;

  const notificacao: GetAllNotificacaoRequisicaoProfessorStatusDoc = {
    tipoNotificacao: TiposNotificacao.RequisicaoProfessorStatus,
    lido: false,
    requisicaoId: payload.requisicaoId.toString(),
    motivo: payload.motivo,
    id: payload._id.toString(),
  };

  reply.sse({
    event: TiposNotificacao.RequisicaoProfessorStatus,
    data: JSON.stringify(notificacao),
  });
}
// ---- Eventos que enviam notificacoes ao frontend ----
