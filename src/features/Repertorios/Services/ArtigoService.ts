import { ArtigoModel } from '../Models/ArtigoModel';
import { Types } from 'mongoose';
import type {
  ArtigoResponse,
  CreateArtigoBody,
  PerfilUsuario,
  UpdateArtigoBody,
} from '../Types';
import type { Service } from '../../../shared/Types';
import { montarInfosRepertorio } from '../Helpers/MontarInfosRepertorio';

export const ArtigoService: Service = {
  create: async (createArtigoData: CreateArtigoBody, userId: string) => {
    const { autor, fonte, resumo, subtopicos, titulo } = createArtigoData;

    const artigo = new ArtigoModel({
      autor,
      fonte,
      resumo,
      criador: userId,
      subtopicos,
      titulo,
    });
    await artigo.save();

    return { success: true, data: 'Artigo criado com sucesso.' };
  },
  update: async (updateArtigoData: UpdateArtigoBody, artigoId: string) => {
    const artigo = await ArtigoModel.findByIdAndUpdate(
      artigoId,
      updateArtigoData,
    );

    if (!artigo) {
      return {
        success: false,
        status: 404,
        message: `Artigo com ID "${artigoId}" não existe.`,
      };
    }

    return { success: true, data: 'Artigo atualizado com sucesso.' };
  },
  get: async (artigoId: string, userId: string) => {
    const artigo = await ArtigoModel.findById(artigoId)
      .populate('criador', '_id nome email')
      .populate('comentarios.usuario', '_id nome');

    if (!artigo) {
      return {
        success: false,
        status: 404,
        message: `Artigo com ID "${artigoId}" não existe.`,
      };
    }

    const repertorioInfo = montarInfosRepertorio(artigo, userId);

    const response: ArtigoResponse = {
      id: artigo._id.toString(),
      ...repertorioInfo,
      titulo: artigo.titulo,
      resumo: artigo.resumo,
      autor: artigo.autor,
      fonte: artigo.fonte,
      criador: artigo.criador as unknown as PerfilUsuario,
      comentarios: artigo.comentarios.map((comentario) => ({
        id: comentario._id.toString(),
        usuario: comentario.usuario as unknown as PerfilUsuario,
        texto: comentario.texto,
      })),
      subtopicos: artigo.subtopicos,
    };

    return { success: true, data: response };
  },
};
