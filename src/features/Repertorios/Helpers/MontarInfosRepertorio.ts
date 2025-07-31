import { Types } from 'mongoose';
import type { Repertorio } from '../Types';

export function montarInfosRepertorio(repertorio: Repertorio, userId?: string) {
  const totalLikes = repertorio.likes.length;
  const likeDoUsuario = userId
    ? repertorio.likes.includes(new Types.ObjectId(userId))
    : false;
  const favoritadoPorUsuario = userId
    ? repertorio.favoritos.includes(new Types.ObjectId(userId))
    : false;

  return {
    totalLikes,
    likeDoUsuario,
    favoritadoPorUsuario,
  };
}
