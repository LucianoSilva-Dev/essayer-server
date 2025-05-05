import type { GetAllRepertorioQueryBody } from "../Types";

export const montarFiltros = (
  queryBody: GetAllRepertorioQueryBody,
  userId: string,
) => {
  // biome-ignore lint/suspicious/noExplicitAny: No need to be strict here
  const query: any = {};

  if (queryBody.tipoRepertorio) {
    query.tipoRepertorio = { $in: Array.from(queryBody.tipoRepertorio) };
  }

  if (queryBody.conteudo) {
    // manter atualizado para incluir todos os campos que podem ser buscados
    // atraves da barra de pesquisa em todos os repertorios
    query.titulo = { $exists: true, $regex: queryBody.conteudo, $options: 'i' };
    query.resumo = { $exists: true, $regex: queryBody.conteudo, $options: 'i' };
    query.frase = { $exists: true, $regex: queryBody.conteudo, $options: 'i' };
    query.autor = { $exists: true, $regex: queryBody.conteudo, $options: 'i' };
    query.fonte = { $exists: true, $regex: queryBody.conteudo, $options: 'i' };
  }

  if (queryBody.subtopicos) {
    query.subtopicos = { $all: queryBody.subtopicos };
  }

  if (queryBody.criador) {
    query.criador = queryBody.criador;
  }

  if (queryBody.favoritadoPeloUsuario) {
    query.favoritadoPeloUsuario = userId;
  }

  if (queryBody.likeDoUsuario) {
    query.likeDoUsuario = userId;
  }

  return query;
};