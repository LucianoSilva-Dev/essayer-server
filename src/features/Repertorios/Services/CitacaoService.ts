import type { Service } from '../../../shared/Types';
import { montarInfosRepertorio } from '../Helpers/MontarInfosRepertorio';
import { CitacaoModel } from '../Models/CitacaoModel';
import type {
  CitacaoResponse,
  CreateCitacaoBody,
  PerfilUsuario,
  UpdateCitacaoBody,
} from '../Types';
import { Types } from 'mongoose';

export const CitacaoService: Service = {
  create: async (createCitacaoData: CreateCitacaoBody, userId: string) => {
    const { frase, autor, fonte, subtopicos, topicos } = createCitacaoData;

    const citacao = new CitacaoModel({
      frase,
      autor,
      fonte,
      criador: userId,
      subtopicos,
      topicos
    });
    await citacao.save();

    return { success: true, data: 'citação criada com sucesso.' };
  },
  update: async (updateCitacaoData: UpdateCitacaoBody, citacaoId: string) => {
    const citacao = await CitacaoModel.findByIdAndUpdate(
      citacaoId,
      updateCitacaoData,
    );

    if (!citacao) {
      return {
        success: false,
        status: 404,
        message: `Citação com ID "${citacaoId}" não existe.`,
      };
    }

    return { success: true, data: 'citação atualizada com sucesso.' };
  },
  get: async (citacaoId: string, userId?: string) => {
    const citacao = await CitacaoModel.findById(citacaoId)
      .populate('criador', '_id nome email fotoPath')
      .populate('comentarios.usuario', '_id nome fotoPath');

    if (!citacao) {
      return {
        success: false,
        status: 404,
        message: `Citação com ID "${citacaoId}" não existe.`,
      };
    }

    const repertorioInfo = montarInfosRepertorio(citacao, userId);

    const response: CitacaoResponse = {
      id: citacao._id.toString(),
      ...repertorioInfo,
      frase: citacao.frase,
      autor: citacao.autor,
      fonte: citacao.fonte ? citacao.fonte : undefined,
      criador: citacao.criador as unknown as PerfilUsuario,
      favoritadoPeloUsuario: citacao.favoritos.includes(new Types.ObjectId(userId)),
      totalComentarios: citacao.comentarios.length,
      comentarios: citacao.comentarios.map((comentario) => ({
        id: comentario._id.toString(),
        usuario: comentario.usuario as unknown as PerfilUsuario,
        texto: comentario.texto,
      })),
      subtopicos: citacao.subtopicos,
      topicos: citacao.topicos
    };

    return { success: true, data: response };
  },
};