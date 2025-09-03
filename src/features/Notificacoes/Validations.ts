import { z } from 'zod';
import { TiposNotificacao } from './Types';

export const getAllNotificacaoTarefaEnviadaDoc = z.object({
  tipoNotificacao: z.literal(TiposNotificacao.TarefaEnviada),
  lido: z.boolean(),
  tarefaId: z.string(),
});

export const getAllNotificacaoTarefaFechadaDoc = z.object({
  tipoNotificacao: z.literal(TiposNotificacao.TarefaFechada),
  lido: z.boolean(),
  tarefaId: z.string(),
});

export const getAllNotificacaoTarefaCorrigidaDoc = z.object({
  tipoNotificacao: z.literal(TiposNotificacao.TarefaCorrigida),
  lido: z.boolean(),
  tarefaId: z.string(),
});

// Rota getAll
export const getAllNotificacaoResponse = z.array(
  z
    .discriminatedUnion('tipoNotificacao', [
      getAllNotificacaoTarefaEnviadaDoc,
      getAllNotificacaoTarefaFechadaDoc,
      getAllNotificacaoTarefaCorrigidaDoc,
    ])
    .optional(),
);

// Rota changeStatus
export const changeStatusNotificacaoBodyValidation = z.object({
  notificacaoIds: z
    .array(
      z
        .string({
          invalid_type_error: 'O array "ids" pode conter apenas strings',
        })
        .nonempty({ message: 'O id da notificação não pode ser vazio' }),
    )
});
