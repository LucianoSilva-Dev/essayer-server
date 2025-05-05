import { Types, type HydratedDocument } from 'mongoose';
import type {
  GetAllRepertorioObraDoc,
  Obra,
  PopulatedWithCriador,
} from '../Types';

export function formatObraDoc(
  repertorio: HydratedDocument<Obra & PopulatedWithCriador>,
  userId: string,
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
    likeDoUsuario: repertorio.likes.includes(new Types.ObjectId(userId)),
    favoritadoPeloUsuario: repertorio.favoritos.includes(
      new Types.ObjectId(userId),
    ),
    criador: {
      id: criador._id.toString(),
      nome: criador.nome,
      fotoPerfil: criador.foto,
    },
  };
  return formattedObra;
}
