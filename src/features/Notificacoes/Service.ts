import { mapGetAllNotificacaoResponse } from './Helpers/MapGetAllNotificacao';
import { NotificacaoModel } from './Models/NotificacaoModel';
import type { GetAllNotificacoesResponse } from './Types';

export const NotificacaoService = {
  getAll: async (userId: string) => {
    const notificacoes = await NotificacaoModel.find({
      remetentes: userId,
    }).lean();

    const notificacoesResponse: GetAllNotificacoesResponse =
      mapGetAllNotificacaoResponse(notificacoes);

    return { success: true, data: notificacoesResponse } as const;
  },
};
