import type { Types } from 'mongoose';
import type {
  NotificacaoTarefaEnviada,
  GetAllNotificacaoTarefaCorrigidaDoc,
} from '../Types';

import { TiposNotificacao } from '../Types';

export function formatTarefaCorrigida(
  notificacao: NotificacaoTarefaEnviada,
  userId: Types.ObjectId
): GetAllNotificacaoTarefaCorrigidaDoc {
  return {
    tarefaId: notificacao.atividade._id.toString(),
    lido: notificacao.lidoPor.filter((value) => value === userId).length > 0,
    tipoNotificacao: TiposNotificacao.TarefaCorrigida,
    id: notificacao._id.toString(),
  };
}
