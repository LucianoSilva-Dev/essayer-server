import { Schema, Types, model } from 'mongoose';
import type {
  NotificacaoTarefaCorrigida,
  NotificacaoTarefaEnviada,
  NotificacaoTarefaFechada,
  Notificacao,
} from '../Types';
import { TiposNotificacao } from '../Types';

const NotificacaoSchema = new Schema<Notificacao>(
  {
    remetentes: [{ type: Types.ObjectId, required: true, ref: 'Usuario' }],
    data: { type: Date, required: true, default: Date.now },
    tipoNotificacao: { type: String, required: true },
  },
  {
    timestamps: true,
    discriminatorKey: 'tipoNotificacao', // Chave para diferenciar os tipos de atividade
  },
);

export const NotificacaoModel = model<Notificacao>(
  'Notificacao',
  NotificacaoSchema,
);

// Tarefa Enviada
export const NotificacaoTarefaEnviadaModel =
  NotificacaoModel.discriminator<NotificacaoTarefaEnviada>(
    TiposNotificacao.TarefaEnviada,
    new Schema({
      atividade: { type: Types.ObjectId, required: true },
    }),
  );

// Tarefa Fechada
export const NotificacaoTarefaFechadaModel =
  NotificacaoModel.discriminator<NotificacaoTarefaFechada>(
    TiposNotificacao.TarefaFechada,
    new Schema({
      atividade: { type: Types.ObjectId, required: true },
    }),
  );

// Tarefa Corrigida
export const NotificacaoTarefaCorrigidaModel =
  NotificacaoModel.discriminator<NotificacaoTarefaCorrigida>(
    TiposNotificacao.TarefaCorrigida,
    new Schema({
      atividade: { type: Types.ObjectId, required: true },
    }),
  );
