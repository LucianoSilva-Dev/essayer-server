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

  if (queryBody.favoritadoPeloUsuario) {
    query.favoritos = userId;
  }

  if (queryBody.likeDoUsuario) {
    query.likes = userId;
  }

  return query;
};
