import { Types, type HydratedDocument } from 'mongoose';
import type {
  Artigo,
  GetAllRepertorioArtigoDoc,
  PopulatedWithCriador,
} from '../Types';

export function formatArtigoDoc(
  repertorio: HydratedDocument<Artigo & PopulatedWithCriador>,
  userId?: string,
): GetAllRepertorioArtigoDoc {
  const {
    __v,
    _id,
    comentarios,
    createdAt,
    updatedAt,
    likes,
    favoritos,
    criador,
    ...resto
  } = repertorio.toObject();
  const formattedArtigo: GetAllRepertorioArtigoDoc = {
    ...resto,
    id: _id.toString(),
    tipoRepertorio: 'Artigo',
    totalLikes: repertorio.likes.length,
    likeDoUsuario: userId
      ? repertorio.likes.includes(new Types.ObjectId(userId))
      : false,
    favoritadoPeloUsuario: userId
      ? repertorio.favoritos.includes(new Types.ObjectId(userId))
      : false,
    criador: {
      id: criador._id.toString(),
      nome: criador.nome,
      fotoPath: criador.fotoPath,
    }
  };
  return formattedArtigo;
}
