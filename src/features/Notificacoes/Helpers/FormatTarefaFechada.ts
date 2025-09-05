import type { Types } from 'mongoose';
import type {
  NotificacaoTarefaEnviada,
  GetAllNotificacaoTarefaFechadaDoc,
} from '../Types';

import { TiposNotificacao } from '../Types';

export function formatTarefaFechada(
  notificacao: NotificacaoTarefaEnviada,
  userId: Types.ObjectId
): GetAllNotificacaoTarefaFechadaDoc {
  return {
    tarefaId: notificacao.atividade._id.toString(),
    lido: notificacao.lidoPor.filter((value) => value === userId).length > 0,
    tipoNotificacao: TiposNotificacao.TarefaFechada,
  };
}
