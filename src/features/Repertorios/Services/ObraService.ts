import type { Service } from '../../../shared/Types';
import { ObraModel } from '../Models/ObraModel';
import { Types } from 'mongoose';
import type {
  CreateObraBody,
  ObraResponse,
  PerfilUsuario,
  UpdateObraBody,
} from '../Types';
import { montarInfosRepertorio } from '../Helpers/MontarInfosRepertorio';

export const ObraService: Service = {
  create: async (createObraData: CreateObraBody, userId: string) => {
    const { titulo, sinopse, autor, tipoObra, subtopicos, topicos } = createObraData;
    const obra = new ObraModel({
      titulo,
      sinopse,
      autor,
      criador: userId,
      tipoObra,
      subtopicos,
      topicos,
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
  get: async (obraId: string, userId?: string) => {
    const obra = await ObraModel.findById(obraId)
      .populate('criador', '_id nome email fotoPath')
      .populate('comentarios.usuario', '_id nome fotoPath');

    if (!obra) {
      return {
        success: false,
        status: 404,
        message: `Obra com ID "${obraId}" não existe.`,
      };
    }

    const repertorioInfo = montarInfosRepertorio(obra, userId);

    const response: ObraResponse = {
      id: obra._id.toString(),
      ...repertorioInfo,
      titulo: obra.titulo,
      sinopse: obra.sinopse,
      autor: obra.autor,
      criador: obra.criador as unknown as PerfilUsuario,
      favoritadoPeloUsuario: obra.favoritos.includes(new Types.ObjectId(userId)),
      totalComentarios: obra.comentarios.length,
      comentarios: obra.comentarios.map((comentario) => ({
        id: comentario._id.toString(),
        usuario: comentario.usuario as unknown as PerfilUsuario,
        texto: comentario.texto,
      })),
      subtopicos: obra.subtopicos,
      tipoObra: obra.tipoObra,
      topicos: obra.topicos
    };
    return { success: true, data: response };
  },
};