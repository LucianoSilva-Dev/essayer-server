import type { Service } from '../../../shared/Types';
import { montarFiltros } from '../Helpers/MontarFiltros';
import { montarPaginação } from '../Helpers/MontarPaginacao';
import { RepertorioModel } from '../Models/RepertorioModel';
import type {
  CreateComentarioBody,
  GetAllRepertorioQueryBody,
  GetAllRepertorioResponse,
  PopulatedRepertorio,
} from '../Types';
import { formatGetAllRepertorioQuery } from '../Helpers/FormatGetAllQuery';
import { montarSort } from '../Helpers/MontarSort';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export const RepertorioService: Service = {
  getAll: async (
    queryBody: GetAllRepertorioQueryBody,
    reqUrl: string,
    userId?: string,
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

    const [repertorios, totalDocuments] = await Promise.all([
      RepertorioModel.find(filtros)
        .skip(queryBody.offset)
        .limit(queryBody.limit)
        .sort(sort)
        .populate<Pick<PopulatedRepertorio, 'criador'>>('criador')
        .exec(),

      RepertorioModel.countDocuments(filtros),
    ]);

    const paginacao = montarPaginação(queryBody, reqUrl, totalDocuments);

    const formattedRepertorios = formatGetAllRepertorioQuery(
      repertorios,
      userId,
    );
    const response: GetAllRepertorioResponse = {
      documentos: formattedRepertorios,
      paginacao,
    };

    return { success: true, data: response };
  },
  delete: async (repertorioId: string) => {
    const repertorio = await RepertorioModel.findByIdAndDelete(repertorioId);
    if (!repertorio) {
      return {
        success: false,
        status: 404,
        message: `Repertório com ID "${repertorioId}" não existe.`,
      };
    }
    return { success: true, data: 'Repertório deletado com sucesso.' };
  },

  createComentario: async (
    repertorioId: string,
    userId: string,
    comentarioBody: CreateComentarioBody,
  ) => {
    const repertorio = await RepertorioModel.findById(repertorioId);
    if (!repertorio) {
      return {
        success: false,
        status: 404,
        message: `Repertório com ID "${repertorioId}" não existe.`,
      };
    }

    const comentario = repertorio.comentarios.create({
      usuario: userId,
      texto: comentarioBody.texto,
    });
    repertorio.comentarios.push(comentario);
    await repertorio.save();

    return { success: true, data: 'Comentario criado com sucesso.' };
  },
  deleteComentario: async (repertorioId: string, comentarioId: string) => {
    const repertorio = await RepertorioModel.findById(repertorioId);
    if (!repertorio) {
      return {
        success: false,
        status: 404,
        message: `Repertório com ID "${repertorioId}" não existe.`,
      };
    }

    const comentario = repertorio.comentarios.id(comentarioId);
    if (!comentario) {
      return {
        success: false,
        status: 404,
        message: `Comentario com ID "${comentarioId}" não existe no repertorio de id ${repertorioId}`,
      };
    }

    await comentario.deleteOne();
    await repertorio.save();

    return { success: true, data: 'Comentario removido com sucesso.' };
  },

  createLike: async (repertorioId: string, userId: string) => {
    const repertorio = await RepertorioModel.findById(repertorioId);
    if (!repertorio) {
      return {
        success: false,
        status: 404,
        message: `Repertório com ID "${repertorioId}" não existe.`,
      };
    }

    if (repertorio.likes.includes(new Types.ObjectId(userId))) {
      return {
        success: false,
        status: 409,
        message: 'Você já deu like nesse repertório.',
      };
    }

    repertorio.likes.push(new Types.ObjectId(userId));
    await repertorio.save();

    return { success: true, data: 'Like adicionado com sucesso.' };
  },
  deleteLike: async (repertorioId: string, userId: string) => {
    const repertorio = await RepertorioModel.findById(repertorioId);
    if (!repertorio) {
      return {
        success: false,
        status: 404,
        message: `Repertório com ID "${repertorioId}" não existe.`,
      };
    }
    const likeIndex = repertorio.likes.indexOf(new Types.ObjectId(userId));
    if (likeIndex === -1) {
      return {
        success: false,
        status: 404,
        message: 'Você ainda não deu like nesse repertório.',
      };
    }

    repertorio.likes.splice(likeIndex, 1);
    await repertorio.save();

    return { success: true, data: 'Like removido com sucesso.' };
  },

  createFavorito: async (repertorioId: string, userId: string) => {
    const repertorio = await RepertorioModel.findById(repertorioId);
    if (!repertorio) {
      return {
        success: false,
        status: 404,
        message: `Repertório com ID "${repertorioId}" não existe.`,
      };
    }

    if (repertorio.favoritos.includes(new Types.ObjectId(userId))) {
      return {
        success: false,
        status: 409,
        message: 'Você já favoritou esse repertório.',
      };
    }

    repertorio.favoritos.push(new Types.ObjectId(userId));
    await repertorio.save();

    return { success: true, data: 'Repertório favoritado com sucesso.' };
  },
  deleteFavorito: async (repertorioId: string, userId: string) => {
    const repertorio = await RepertorioModel.findById(repertorioId);
    if (!repertorio) {
      return {
        success: false,
        status: 404,
        message: `Repertório com ID "${repertorioId}" não existe.`,
      };
    }

    const favoritoIndex = repertorio.favoritos.indexOf(
      new Types.ObjectId(userId),
    );
    if (favoritoIndex === -1) {
      return {
        success: false,
        status: 404,
        message: 'Você ainda não favoritou esse repertório.',
      };
    }

    repertorio.favoritos.splice(favoritoIndex, 1);
    await repertorio.save();

    return { success: true, data: 'Repertório removido dos favoritos.' };
  },
};
