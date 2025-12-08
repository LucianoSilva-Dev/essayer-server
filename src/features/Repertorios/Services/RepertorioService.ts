import { Types } from 'mongoose';
import type { Service, UserCargo } from '../../../shared/Types';
import { formatGetAllRepertorioQuery, formatRepertorio } from '../Helpers/FormatGetAllQuery';
import { montarFiltros } from '../Helpers/MontarFiltros';
import { montarPaginação } from '../Helpers/MontarPaginacao';
import { montarSort } from '../Helpers/MontarSort';
import { RepertorioModel } from '../Models/RepertorioModel';
import type {
  CreateComentarioBody,
  FixComentarioBody,
  GetAllRepertorioQueryBody,
  GetAllRepertorioResponse,
  PopulatedRepertorio,
  UpdateComentarioBody,
} from '../Types';

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
        status: 401,
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

  getByIds: async (ids: string[], userId?: string) => {
    const repertorios = await RepertorioModel.find({ _id: { $in: ids } })
      .populate<Pick<PopulatedRepertorio, 'criador'>>('criador')
      .exec();

    const repertoriosMap = new Map(
      repertorios.map((r) => [r._id.toString(), r]),
    );

    const orderedRepertorios = ids.map((id) => repertoriosMap.get(id) || null);

    const formattedRepertorios = orderedRepertorios.map((r) =>
      r ? formatRepertorio(r, userId) : null,
    );

    return { success: true, data: formattedRepertorios };
  },
  delete: async (repertorioId: string, userId: string, userRole: UserCargo) => {
    const repertorio = await RepertorioModel.findById(repertorioId);
    if (!repertorio) {
      return {
        success: false,
        status: 404,
        message: `Repertório com ID "${repertorioId}" não existe.`,
      };
    }

    if (repertorio.criador.toString() !== userId && userRole !== 'admin') {
      return {
        success: false,
        status: 403,
        message: 'Você não tem permissão para deletar este repertório.',
      };
    }

    await RepertorioModel.findByIdAndDelete(repertorioId);
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
      fixado: comentarioBody.fixar || false,
    });
    repertorio.comentarios.push(comentario);
    await repertorio.save();

    return { success: true, data: 'Comentario criado com sucesso.' };
  },
  updateComentario: async (
    repertorioId: string,
    comentarioId: string,
    userId: string,
    userRole: UserCargo,
    comentarioBody: UpdateComentarioBody,
  ) => {
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

    if (comentario.usuario.toString() !== userId) {
      return {
        success: false,
        status: 403,
        message: 'Você não tem permissão para editar este comentário.',
      };
    }

    comentario.texto = comentarioBody.texto;
    await repertorio.save();

    return { success: true, data: 'Comentário atualizado com sucesso.' };
  },
  deleteComentario: async (
    repertorioId: string,
    comentarioId: string,
    userId: string,
    userRole: UserCargo,
  ) => {
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

    if (comentario.usuario.toString() !== userId && userRole !== 'admin') {
      return {
        success: false,
        status: 403,
        message: 'Você não tem permissão para deletar este comentário.',
      };
    }

    await comentario.deleteOne();
    await repertorio.save();

    return { success: true, data: 'Comentario removido com sucesso.' };
  },

  createLike: async (repertorioId: string, userId: string) => {
    const repertorio = await RepertorioModel.findByIdAndUpdate(repertorioId, {
      $addToSet: { likes: userId },
    });

    if (!repertorio) {
      return {
        success: false,
        status: 404,
        message: 'Repertorio não encontrado',
      };
    }

    await repertorio.save();

    return { success: true, data: 'Like criado com sucesso.' };
  },
  deleteLike: async (repertorioId: string, userId: string) => {
    const repertorio = await RepertorioModel.findByIdAndUpdate(repertorioId, {
      $pull: { likes: userId },
    });

    if (!repertorio) {
      return {
        success: false,
        status: 404,
        message: `Repertório com ID "${repertorioId}" não existe.`,
      };
    }

    return { success: true, data: 'Like removido com sucesso.' };
  },

  createFavorito: async (repertorioId: string, userId: string) => {
    const repertorio = await RepertorioModel.findByIdAndUpdate(repertorioId, {
      $addToSet: { favoritos: userId },
    });

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
        message: 'Este repertório já está nos seus favoritos.',
      };
    }

    return { success: true, data: 'Repertório adicionado aos favoritos.' };
  },
  deleteFavorito: async (repertorioId: string, userId: string) => {
    const repertorio = await RepertorioModel.findByIdAndUpdate(repertorioId, {
      $pull: { favoritos: userId },
    });

    if (!repertorio) {
      return {
        success: false,
        status: 404,
        message: `Repertório com ID "${repertorioId}" não existe.`,
      };
    }

    return { success: true, data: 'Repertório removido dos favoritos.' };
  },
  fixarComentario: async (
    repertorioId: string,
    comentarioId: string,
    userId: string,
    userRole: UserCargo,
    comentarioBody: FixComentarioBody,
  ) => {
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

    if (repertorio.criador.toString() !== userId && userRole !== 'admin') {
      return {
        success: false,
        status: 403,
        message: 'Você não tem permissão para fixar este comentário.',
      };
    }

    comentario.fixado = comentarioBody.fixar;

    // Sort comments: pinned first, then by date (newest first)
    repertorio.comentarios.sort((a, b) => {
      if (a.fixado === b.fixado) {
        // If both are pinned or both are not pinned, sort by date (newest first)
        return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
      }
      // Pinned comments come first
      return a.fixado ? -1 : 1;
    });

    await repertorio.save();

    return { success: true, data: 'Comentário fixado/desfixado com sucesso.' };
  },
};
