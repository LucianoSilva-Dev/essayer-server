import type { HydratedDocument } from 'mongoose';
import type { Notificacao, TiposNotificacao } from '../Types';

export function isNotificacaoOfType<T extends Notificacao>(
  notificacao: Notificacao,
  tipo: TiposNotificacao,
): notificacao is T {
  return notificacao ? notificacao.tipoNotificacao === tipo : false;
}
