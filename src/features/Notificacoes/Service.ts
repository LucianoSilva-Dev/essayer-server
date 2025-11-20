import { Types } from 'mongoose';
import { mapGetAllNotificacaoResponse } from './Helpers/MapGetAllNotificacao';
import { NotificacaoModel } from './Models/NotificacaoModel';
import type { GetAllNotificacoesResponse } from './Types';

export const NotificacaoService = {
  getAll: async (userId: string) => {
    const notificacoes = await NotificacaoModel.find({
      remetentes: userId,
    }).lean();

    const notificacoesResponse: GetAllNotificacoesResponse =
      mapGetAllNotificacaoResponse(notificacoes, new Types.ObjectId(userId));

    return { success: true, data: notificacoesResponse } as const;
  },

  changeStatus: async (userId: string, notificacoesId: string[]) => {
    await NotificacaoModel.updateMany(
      {
        _id: notificacoesId
      },
      {
        $addToSet: {
          lidoPor: userId,
        },
      },
    );


    return { success: true } as const;
  },
};
