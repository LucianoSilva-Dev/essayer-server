import type { Types } from 'mongoose';
import type {
  GetAllNotificacaoRequisicaoProfessorStatusDoc,
  NotificacaoRequisicaoProfessorStatus,
} from '../Types';

import { TiposNotificacao } from '../Types';

export function formatRequisicaoProfessorStatus(
  notificacao: NotificacaoRequisicaoProfessorStatus,
  userId: Types.ObjectId
): GetAllNotificacaoRequisicaoProfessorStatusDoc {
  return {
    requisicaoId: notificacao.requisicaoId._id.toString(),
    lido: notificacao.lidoPor.filter((value) => value === userId).length > 0,
    tipoNotificacao: TiposNotificacao.RequisicaoProfessorStatus,
    motivo: notificacao.motivo,
    id: notificacao._id.toString(),
  };
}
