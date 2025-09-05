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
      const redacao = await RedacaoLivreModel.findOne({
        _id: id,
        aluno: usuario,
      });

      if (!redacao) {
        return {
          success: false,
          status: 404,
          message: `Redação livre com o id ${id} não existe ou você não tem permissão para acessá-la.`,
        };
      }

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
};
