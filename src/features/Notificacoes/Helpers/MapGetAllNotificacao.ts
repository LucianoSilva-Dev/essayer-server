import type { Types } from 'mongoose';
import type {
  NotificacaoTarefaCorrigida,
  NotificacaoTarefaFechada,
  GetAllNotificacoesResponse,
  Notificacao,
  NotificacaoTarefaEnviada,
} from '../Types';

import { TiposNotificacao } from '../Types';
import { isNotificacaoOfType } from './TypeGuard';
import { formatTarefaEnviada } from './FormatTarefaEnviada';
import { formatTarefaFechada } from './FormatTarefaFechada';
import { formatTarefaCorrigida } from './FormatTarefaCorrigida';

export function mapGetAllNotificacaoResponse(
  notificacoes: Notificacao[],
  userId: Types.ObjectId,
): GetAllNotificacoesResponse {
  return notificacoes.map((notificacao) => {
    if (
      isNotificacaoOfType<NotificacaoTarefaEnviada>(
        notificacao,
        TiposNotificacao.TarefaEnviada,
      )
    )
      return formatTarefaEnviada(notificacao, userId);

    if (
      isNotificacaoOfType<NotificacaoTarefaFechada>(
        notificacao,
        TiposNotificacao.TarefaFechada,
      )
    )
      return formatTarefaFechada(notificacao, userId);

    if (
      isNotificacaoOfType<NotificacaoTarefaCorrigida>(
        notificacao,
        TiposNotificacao.TarefaCorrigida,
      )
    )
      return formatTarefaCorrigida(notificacao, userId);
  });
}
