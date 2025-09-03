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
        tipoNotificacao: TiposNotificacao.TarefaCorrigida,
      };

      return TarefaCorrigida;
    }
  });
}
