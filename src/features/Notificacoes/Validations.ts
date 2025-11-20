import { z } from 'zod';
import { TiposNotificacao } from './Types';
import { isValidObjectId } from 'mongoose';

export const getAllNotificacaoTarefaEnviadaDoc = z.object({
  tipoNotificacao: z.literal(TiposNotificacao.TarefaEnviada),
  lido: z.boolean(),
  tarefaId: z.string(),
  id: z.string(),
});

export const getAllNotificacaoTarefaFechadaDoc = z.object({
  tipoNotificacao: z.literal(TiposNotificacao.TarefaFechada),
  lido: z.boolean(),
  tarefaId: z.string(),
  id: z.string(),
});

export const getAllNotificacaoTarefaCorrigidaDoc = z.object({
  tipoNotificacao: z.literal(TiposNotificacao.TarefaCorrigida),
  lido: z.boolean(),
  tarefaId: z.string(),
  id: z.string(),
});

export const getAllNotificacaoRequisicaoProfessorStatusDoc = z.object({
  tipoNotificacao: z.literal(TiposNotificacao.RequisicaoProfessorStatus),
  lido: z.boolean(),
  requisicaoId: z.string(),
  id: z.string(),
  motivo: z.string().optional(),
});

// Rota getAll
export const getAllNotificacaoResponse = z.array(
  z
    .discriminatedUnion('tipoNotificacao', [
      getAllNotificacaoTarefaEnviadaDoc,
      getAllNotificacaoTarefaFechadaDoc,
      getAllNotificacaoTarefaCorrigidaDoc,
      getAllNotificacaoRequisicaoProfessorStatusDoc
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
