import type { GetAllRepertorioQueryBody } from '../Types';

export function montarSort(queryBody: GetAllRepertorioQueryBody) {
  const sort: any = {};
  switch (queryBody.ordenarPor) {
    case 'MaxLikes':
      sort.likes = -1;
      break;
    case 'MinLikes':
      sort.likes = 1;
      break;
    case 'Newest':
      sort.createdAt = -1;
      break;
    case 'Oldest':
      sort.createdAt = 1;
      break;
  }

  return sort
}
