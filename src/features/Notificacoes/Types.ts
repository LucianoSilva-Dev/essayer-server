import type { Types } from 'mongoose';
import type {
  getAllNotificacaoResponse,
  getAllNotificacaoTarefaEnviadaDoc,
  getAllNotificacaoTarefaFechadaDoc,
  getAllNotificacaoTarefaCorrigidaDoc,
  changeStatusNotificacaoBodyValidation,
} from './Validations';
import type { z } from 'zod';

export enum TiposNotificacao {
  TarefaEnviada = 'TarefaEnviada',
  TarefaFechada = 'TarefaFechada',
  TarefaCorrigida = 'TarefaCorrigida',
}

export type Notificacao = {
  _id: Types.ObjectId;
  remetentes: Types.ObjectId[];
  lidoPor: Types.ObjectId[];
  tipoNotificacao: string;
  data: Date;
};

export type NotificacaoTarefaEnviada = Notificacao & {
  atividade: Types.ObjectId;
};

export type NotificacaoTarefaFechada = Notificacao & {
  atividade: Types.ObjectId;
};

export type NotificacaoTarefaCorrigida = Notificacao & {
  atividade: Types.ObjectId;
};

// getAll
export type GetAllNotificacoesResponse = z.infer<
  typeof getAllNotificacaoResponse
>;
export type GetAllNotificacaoTarefaEnviadaDoc = z.infer<
  typeof getAllNotificacaoTarefaEnviadaDoc
>;
export type GetAllNotificacaoTarefaFechadaDoc = z.infer<
  typeof getAllNotificacaoTarefaFechadaDoc
>;
export type GetAllNotificacaoTarefaCorrigidaDoc = z.infer<
  typeof getAllNotificacaoTarefaCorrigidaDoc
>;

// changeStatus
export type ChangeStatusNotificacaoBody = z.infer<
  typeof changeStatusNotificacaoBodyValidation
>;
