import { CorrigirRedacaoQueue } from '../../shared/CorrecaoRedacaoIA/Queue';
import { EnumCorrecaoRedacaoStatus } from '../../shared/CorrecaoRedacaoIA/Types';
import { RedacaoLivreModel } from './Model';
import type { UpdateRedacaoLivreBody } from './Types';

export const RedacaoLivreService = {
  create: async (tema: string, usuario: string) => {
    try {
      await RedacaoLivreModel.create({
        aluno: usuario,
        tema,
      });

      return { success: true };
    } catch (e) {
      console.log(e);
      return {
        success: false,
        status: 500,
        message: 'Internal Server Error',
      };
    }
  },
  getAll: async (usuario: string) => {
    try {
      const redacoes = await RedacaoLivreModel.find({ aluno: usuario });

      return { success: true, data: redacoes };
    } catch (e) {
      console.log(e);
      return {
        success: false,
        status: 500,
        message: 'Internal Server Error',
      };
    }
  },
  get: async (id: string, usuario: string) => {
    try {
      const redacao = await RedacaoLivreModel.findOneAndUpdate(
        {
          _id: id,
          aluno: usuario,
        },
        {
          $set: {
            'correcoesIA.$[].isNew': false,
          },
        },
      );

      if (!redacao) {
        return {
          success: false,
          status: 404,
          message: `Redação livre com o id ${id} não existe ou você não tem permissão para acessá-la.`,
        };
      }

      // Marca todas as correções atuais como antigas (já leu)

      // Ordena as correções de IA de forma descrescente com base na data de atualização
      redacao.correcoesIA.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );

      return { success: true, data: redacao };
    } catch (e) {
      console.log(e);
      return {
        success: false,
        status: 500,
        message: 'Internal Server Error',
      };
    }
  },
  update: async (id: string, body: UpdateRedacaoLivreBody, usuario: string) => {
    try {
      const redacao = await RedacaoLivreModel.findOneAndUpdate(
        { _id: id, aluno: usuario },
        body,
      );

      if (!redacao) {
        return {
          success: false,
          status: 404,
          message: `Redação livre com o id ${id} não existe ou você não tem permissão para editá-la.`,
        };
      }

      return { success: true };
    } catch (e) {
      console.log(e);
      return {
        success: false,
        status: 500,
        message: 'Internal Server Error',
      };
    }
  },
  delete: async (id: string, usuario: string) => {
    try {
      const redacao = await RedacaoLivreModel.findOneAndDelete({
        _id: id,
        aluno: usuario,
      });

      if (!redacao) {
        return {
          success: false,
          status: 404,
          message: `Redação livre com o id ${id} não existe ou você não tem permissão para excluí-la.`,
        };
      }

      return { success: true };
    } catch (e) {
      console.log(e);
      return {
        success: false,
        status: 500,
        message: 'Internal Server Error',
      };
    }
  },
  deleteCorrecao: async (id: string, correcaoId: string, usuario: string) => {
    try {
      const redacao = await RedacaoLivreModel.findOneAndUpdate(
        { _id: id, aluno: usuario },
        { $pull: { correcoesIA: { _id: correcaoId } } },
      );

      if (!redacao) {
        return {
          success: false,
          status: 404,
          message:
            'Correção não encontrada ou você não tem permissão para excluí-la.',
        };
      }

      // Exclui o job da fila redis caso ele esteja lá
      CorrigirRedacaoQueue.remove(id)

      return { success: true };
    } catch (e) {
      console.log(e);
      return {
        success: false,
        status: 500,
        message: 'Internal Server Error',
      };
    }
  },
};
