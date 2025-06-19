// Backend/src/features/Repertorios/Helpers/MontarFiltros.ts
import { Types } from 'mongoose';
import type { GetAllRepertorioQueryBody } from '../Types';

export const montarFiltros = (
  queryBody: GetAllRepertorioQueryBody,
  userId?: string,
) => {
  // biome-ignore lint/suspicious/noExplicitAny: No need to be strict here
  const query: any = {};

  // Se tipoRepertorio for um array, usa $in. Se for string, usa diretamente.
  if (queryBody.tipoRepertorio) {
    query.tipoRepertorio = Array.isArray(queryBody.tipoRepertorio)
      ? { $in: queryBody.tipoRepertorio }
      : queryBody.tipoRepertorio;
  }

  if (queryBody.conteudo) {
    const regex = new RegExp(queryBody.conteudo, 'i');
    query.$or = [
      { titulo: regex },
      { resumo: regex },
      { sinopse: regex },
      { autor: regex },
      { fonte: regex },
      { frase: regex }, // Adicionado para citações
    ];
  }

  // Se subtopicos for um array, usa $all. Se for string, usa diretamente.
  if (queryBody.subtopicos) {
    query.subtopicos = Array.isArray(queryBody.subtopicos)
      ? { $all: queryBody.subtopicos }
      : queryBody.subtopicos;
  }

  // Se topico for um array, usa $in. Se for string, usa diretamente.
  if (queryBody.topico) {
    query.topico = Array.isArray(queryBody.topico)
      ? { $in: queryBody.topico }
      : queryBody.topico;
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