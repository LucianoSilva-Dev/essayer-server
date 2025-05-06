import type { Service } from '../../../shared/Types';
import { ObraModel } from '../Models/ObraModel';
import { Types } from 'mongoose';
import type {
  CreateObraBody,
  ObraResponse,
  PerfilUsuario,
  UpdateObraBody,
} from '../Types';

export const ObraService: Service = {
  create: async (createObraData: CreateObraBody, userId: string) => {
    const { titulo, sinopse, autor, tipoObra, subtopicos } = createObraData;
    const obra = new ObraModel({
      titulo,
      sinopse,
      autor,
      criador: userId,
      tipoObra,
      subtopicos,
    });
    await obra.save();
    return { success: true, data: 'Obra criada com sucesso.' };
  },
  update: async (updateObraData: UpdateObraBody, obraId: string) => {
    const obra = await ObraModel.findByIdAndUpdate(obraId, updateObraData);
    if (!obra) {
      return {
        success: false,
        status: 404,
        message: `Obra com ID "${obraId}" não existe.`,
      };
    }
    return { success: true, data: 'Obra atualizada com sucesso.' };
  },
  get: async (id: string) => {
    const obra = await ObraModel.findById(id)
      .populate('criador', '_id nome email')
      .populate('comentarios.usuario', '_id nome foto');

    if (!obra) {
      return {
        success: false,
        status: 404,
        message: `Obra com ID "${id}" não existe.`,
      };
    }

    const totalLikes = obra.likes.length;
    const likeDoUsuario = obra.likes.includes(new Types.ObjectId(id));
    const favoritadoPorUsuario = obra.favoritos.includes(
      new Types.ObjectId(id),
    );

    const response: ObraResponse = {
      id: obra._id.toString(),
      titulo: obra.titulo,
      sinopse: obra.sinopse,
      autor: obra.autor,
      criador: obra.criador as unknown as PerfilUsuario,
      totalLikes,
      likeDoUsuario,
      favoritadoPorUsuario,
      comentarios: obra.comentarios.map((comentario) => ({
        id: comentario._id.toString(),
        usuario: comentario.usuario as unknown as PerfilUsuario,
        texto: comentario.texto,
      })),
      subtopicos: obra.subtopicos,
      tipoObra: obra.tipoObra
    };
    return { success: true, data: response };
  },
};
