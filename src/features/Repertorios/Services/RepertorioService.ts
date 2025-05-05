import type { Service } from '../../../shared/Types';
import { montarFiltros } from '../Helpers/MontarFiltros';
import { montarPaginação } from '../Helpers/MontarPaginacao';
import { RepertorioModel } from '../Models/RepertorioModel';
import type {
  GetAllRepertorioQueryBody,
  GetAllRepertorioResponse,
  PopulatedRepertorio,
} from '../Types';
import { formatGetAllRepertorioQuery } from '../Helpers/FormatGetAllQuery';
import { montarSort } from '../Helpers/MontarSort';

export const RepertorioService: Service = {
  getAll: async (
    queryBody: GetAllRepertorioQueryBody,
    reqUrl: string,
    userId = '',
  ) => {
    if (
      (queryBody.favoritadoPeloUsuario && !userId) ||
      (queryBody.likeDoUsuario && !userId)
    ) {
      return {
        success: false,
        status: 403,
        message: 'Você precisa estar logado para fazer isso',
      };
    }

    const filtros = montarFiltros(queryBody, userId);
    const sort = montarSort(queryBody);
    const repertorios = await RepertorioModel.find(filtros)
      .skip(queryBody.offset)
      .limit(queryBody.limit)
      .sort(sort)
      .populate<Pick<PopulatedRepertorio, 'criador'>>('criador');

    const totalDocuments = repertorios.length;
    const paginacao = montarPaginação(queryBody, reqUrl, totalDocuments);

    const formattedRepertorios = formatGetAllRepertorioQuery(
      repertorios,
      userId,
    );
    const response: GetAllRepertorioResponse = {
      documentos: formattedRepertorios,
      paginacao,
    };

    return {
      success: true,
      data: response,
    };
  },
  delete: async (id: string) => {},

  createComentario: async (data: any) => {},
  deleteComentario: async (id: string) => {},

  createLike: async (id: string) => {},
  deleteLike: async (id: string) => {},

  createFavorito: async (id: string) => {},
  deleteFavorito: async (id: string) => {},
};
