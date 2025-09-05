import type { Types } from 'mongoose';
import type {
  NotificacaoTarefaEnviada,
  GetAllNotificacaoTarefaEnviadaDoc,
} from '../Types';

import { TiposNotificacao } from '../Types';

export function formatTarefaEnviada(
  notificacao: NotificacaoTarefaEnviada,
  userId: Types.ObjectId
): GetAllNotificacaoTarefaEnviadaDoc {
  return {
    tarefaId: notificacao.atividade._id.toString(),
    lido: notificacao.lidoPor.filter((value) => value === userId).length > 0,
    tipoNotificacao: TiposNotificacao.TarefaEnviada,
  };
}
