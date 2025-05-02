import { ArtigoModel } from '../Models/ArtigoModel';
import { Types } from 'mongoose';
import type { ArtigoResponse, CreateArtigoBody, PerfilUsuario, UpdateArtigoBody } from '../Types';
import type { Service } from '../../../shared/Types';

export const ArtigoService: Service = {
  create: async (createArtigoData: CreateArtigoBody, userId: string) => {
    const { autor, fonte, resumo, subtopicos, titulo} = createArtigoData;
    
        const artigo = new ArtigoModel({
          autor,
          fonte,
          resumo,
          criador: userId,
          subtopicos,
          titulo
        });
        await artigo.save();
    
        return { success: true, data: 'Artigo criado com sucesso.' };
  },
  update: async (updateArtigoData: UpdateArtigoBody, artigoId: string) => {
    const artigo = await ArtigoModel.findByIdAndUpdate(artigoId, updateArtigoData);
    
        if (!artigo) {
          return {
            success: false,
            status: 404,
            message: `Artigo com ID "${artigoId}" não existe.`,
          };
        }
    
        return { success: true, data: 'Artigo atualizado com sucesso.' };
  },
  get: async (id: string) => {
    const artigo = await ArtigoModel.findById(id)
      .populate('criador', '_id nome email')
      .populate('comentarios.usuario', '_id nome foto');

    if (!artigo) {
      return {
        success: false,
        status: 404,
        message: `Artigo com ID "${id}" não existe.`,
      };
    }

    const totalLikes = artigo.likes.length;
    const likeDoUsuario = artigo.likes.includes(new Types.ObjectId(id));
    const favoritadoPorUsuario = artigo.favoritos.includes(
      new Types.ObjectId(id),
    );

    const response: ArtigoResponse = {
      id: artigo._id.toString(),
      totalLikes,
      likeDoUsuario,
      favoritadoPorUsuario,
      titulo: artigo.titulo,
      resumo: artigo.resumo,
      autor: artigo.autor,
      fonte: artigo.fonte,
      criador: artigo.criador as unknown as PerfilUsuario,
      comentarios: artigo.comentarios.map((comentario) => ({
        usuario: comentario.usuario as unknown as PerfilUsuario,
        texto: comentario.texto,
      })),
      subtopicos: artigo.subtopicos,
    };

    return { success: true, data: response };
  },
};
