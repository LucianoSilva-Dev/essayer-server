import { Types } from 'mongoose';
import type { GetAllRepertorioQueryBody } from '../Types';

export const montarFiltros = (
  queryBody: GetAllRepertorioQueryBody,
  userId?: string,
) => {
  // biome-ignore lint/suspicious/noExplicitAny: No need to be strict here
  const query: any = {};

  if (queryBody.tipoRepertorio) {
    query.tipoRepertorio = queryBody.tipoRepertorio;
  }

  if (queryBody.conteudo) {
    const regex = new RegExp(queryBody.conteudo, 'i');
    query.$or = [
      { titulo: regex },
      { resumo: regex },
      { sinopse: regex },
      { autor: regex },
      { fonte: regex },
    ];
  }

  if (queryBody.subtopicos) {
    query.subtopicos = { $all: queryBody.subtopicos };
  }

  if (queryBody.criador) {
    query.criador = queryBody.criador;
  }

  if (typeof queryBody.favoritadoPeloUsuario === 'boolean' && userId) {
    const userObjectId = new Types.ObjectId(userId);
    switch (queryBody.favoritadoPeloUsuario) {
      case true:
        query.favoritos = userObjectId;
        break;
      case false:
        query.favoritos = { $nin: [userObjectId] };
        break;
    }
  }

  if (typeof queryBody.likeDoUsuario === 'boolean' && userId) {
    const userObjectId = new Types.ObjectId(userId);
    switch (queryBody.likeDoUsuario) {
      case true:
        query.likes = userObjectId;
        break;
      case false:
        query.likes = { $nin: [userObjectId] };
        break;
    }
  }

  return query;
};
