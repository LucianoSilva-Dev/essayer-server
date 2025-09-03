import type { Types } from 'mongoose';
import type {
  GetAllNotificacaoTarefaCorrigidaDoc,
  GetAllNotificacaoTarefaEnviadaDoc,
  GetAllNotificacaoTarefaFechadaDoc,
  NotificacaoTarefaCorrigida,
  NotificacaoTarefaFechada,
  GetAllNotificacoesResponse,
  Notificacao,
  NotificacaoTarefaEnviada,
} from '../Types';

import { TiposNotificacao } from '../Types';
import { isNotificacaoOfType } from './TypeGuard';

export function mapGetAllNotificacaoResponse(
  notificacoes: Notificacao[],
  userId: Types.ObjectId
): GetAllNotificacoesResponse {
  return notificacoes.map((notificacao) => {
    if (
      isNotificacaoOfType<NotificacaoTarefaEnviada>(
        notificacao,
        TiposNotificacao.TarefaEnviada,
      )
    ) {
      const TarefaEnviada: GetAllNotificacaoTarefaEnviadaDoc = {
        tarefaId: notificacao.atividade._id.toString(),
        lido: notificacao.lidoPor.filter((value) => value === userId).length > 0,
        tipoNotificacao: TiposNotificacao.TarefaEnviada,
      };
      return TarefaEnviada;
    }

    if (
      isNotificacaoOfType<NotificacaoTarefaFechada>(
        notificacao,
        TiposNotificacao.TarefaEnviada,
      )
    ) {
      const TarefaFechada: GetAllNotificacaoTarefaFechadaDoc = {
        tarefaId: notificacao.atividade._id.toString(),
        lido: notificacao.lidoPor.filter((value) => value === userId).length > 0,
        tipoNotificacao: TiposNotificacao.TarefaFechada,
      };

      return TarefaFechada;
    }

    if (
      isNotificacaoOfType<NotificacaoTarefaCorrigida>(
        notificacao,
        TiposNotificacao.TarefaEnviada,
      )
    ) {
      const TarefaCorrigida: GetAllNotificacaoTarefaCorrigidaDoc = {
        tarefaId: notificacao.atividade._id.toString(),
        lido: notificacao.lidoPor.filter((value) => value === userId).length > 0,
        tipoNotificacao: TiposNotificacao.TarefaCorrigida,
      };

      return TarefaCorrigida;
    }
  });
}
