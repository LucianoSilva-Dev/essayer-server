import { z } from 'zod';
import { TiposNotificacao } from './Types';
import { isValidObjectId } from 'mongoose';
import { tiposAtividade } from '../../shared/Atividade/Validations';

export const getAllNotificacaoTarefaEnviadaDoc = z.object({
  tipoNotificacao: z.literal(TiposNotificacao.TarefaEnviada),
  tipoAtividade: tiposAtividade,
  lido: z.boolean(),
  tarefaId: z.string(),
});

export const getAllNotificacaoTarefaFechadaDoc = z.object({
  tipoNotificacao: z.literal(TiposNotificacao.TarefaFechada),
  tipoAtividade: tiposAtividade,
  lido: z.boolean(),
  tarefaId: z.string(),
});

export const getAllNotificacaoTarefaCorrigidaDoc = z.object({
  tipoNotificacao: z.literal(TiposNotificacao.TarefaCorrigida),
  tipoAtividade: tiposAtividade,
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
  notificacaoIds: z.array(
    z
      .string({
        invalid_type_error: 'O array "ids" pode conter apenas strings',
      })
      .nonempty({ message: 'O id da notificação não pode ser vazio' }),
  ),
});

// Rota listen
export const listenNotificacaoUserIdValidation = z.object({
  userId: z
    .string({
      required_error: 'O campo userId é obrigatório.',
      invalid_type_error: 'O campo userId deve ser um texto.',
    })
    .refine((userId) => isValidObjectId(userId), 'userId inválido.'),
});
