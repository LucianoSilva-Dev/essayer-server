import { Types, type HydratedDocument } from 'mongoose';
import type {
  Citacao,
  GetAllRepertorioCitacaoDoc,
  PopulatedWithCriador,
} from '../Types';

export function formatCitacaoDoc(
  repertorio: HydratedDocument<Citacao & PopulatedWithCriador>,
  userId?: string,
): GetAllRepertorioCitacaoDoc {
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
  const formattedCitacao: GetAllRepertorioCitacaoDoc = {
    ...resto,
    id: _id.toString(),
    tipoRepertorio: 'Citacao',
    likeDoUsuario: userId
      ? repertorio.likes.includes(new Types.ObjectId(userId))
      : false,
    favoritadoPeloUsuario: userId
      ? repertorio.favoritos.includes(new Types.ObjectId(userId))
      : false,
    criador: {
      id: criador._id.toString(),
      nome: criador.nome,
      fotoPerfil: criador.foto,
    },
  };
  return formattedCitacao;
}
