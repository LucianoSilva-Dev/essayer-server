import { Types, type HydratedDocument } from 'mongoose';
import type {
  GetAllRepertorioObraDoc,
  Obra,
  PopulatedWithCriador,
} from '../Types';

export function formatObraDoc(
  repertorio: HydratedDocument<Obra & PopulatedWithCriador>,
  userId?: string,
) {
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

  const formattedObra: GetAllRepertorioObraDoc = {
    ...resto,
    id: _id.toString(),
    tipoRepertorio: 'Obra',
    likeDoUsuario: userId
      ? repertorio.likes.includes(new Types.ObjectId(userId))
      : false,
    favoritadoPeloUsuario: userId
      ? repertorio.favoritos.includes(new Types.ObjectId(userId))
      : false,
    criador: {
      id: criador._id.toString(),
      nome: criador.nome,
    },
  };
  return formattedObra;
}
