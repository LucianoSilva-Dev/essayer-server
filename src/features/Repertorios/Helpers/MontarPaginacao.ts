import type { GetAllRepertorioQueryBody } from "../Types";

export const montarPaginação = (
  queryBody: GetAllRepertorioQueryBody,
  reqUrl: string,
  totalDocuments: number,
) => {
  // Calcula novos offsets
  const nextOffset = Math.min(
    queryBody.offset + queryBody.limit,
    totalDocuments,
  );
  const prevOffset = Math.max(queryBody.offset - queryBody.limit, 0);

  // Remove parâmetros antigos
  let cleanUrl = reqUrl.replace(/([?&])(offset|limit)=\d+/g, '');
  cleanUrl = cleanUrl.replace(/[?&]$/, '');

  const separator = cleanUrl.includes('?') ? '&' : '?';

  // Constrói novas URLs
  const nextPageUrl =
    nextOffset >= totalDocuments
      ? null
      : `${cleanUrl}${separator}offset=${nextOffset}&limit=${queryBody.limit}`;

  const previousPageUrl =
    queryBody.offset === 0
      ? null
      : `${cleanUrl}${separator}offset=${prevOffset}&limit=${queryBody.limit}`;

  return {
    offset: queryBody.offset,
    limit: queryBody.limit,
    nextPageUrl,
    previousPageUrl,
    totalDocuments,
  };
};