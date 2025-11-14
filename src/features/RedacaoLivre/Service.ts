import { GetModelPriority } from '../../shared/CorrecaoRedacaoIA/Helpers/GetModelPriority';
import { CorrigirRedacaoQueue } from '../../shared/CorrecaoRedacaoIA/Queue';
import { EnumCorrecaoRedacaoStatus } from '../../shared/CorrecaoRedacaoIA/Types';
import { checkModelAvailability } from '../../shared/CorrecaoRedacaoIA/Worker/CheckModelAvailability';
import { RedacaoLivreModel } from './Model';
import type { CreateRedacaoLivreBody, UpdateRedacaoLivreBody } from './Types';

export const RedacaoLivreService = {
  create: async (body: CreateRedacaoLivreBody, usuario: string) => {
    try {
      const { tema, duracao } = body;

      await RedacaoLivreModel.create({
        aluno: usuario,
        tema,
        duracao,
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
      CorrigirRedacaoQueue.remove(correcaoId);

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

  retryCorrecao: async (id: string, correcaoId: string, usuario: string) => {
    try {
      const redacao = await RedacaoLivreModel.findOne({
        _id: id,
        aluno: usuario,
      });

      if (!redacao) {
        return {
          success: false,
          status: 404,
          message:
            'Redação não encontrada ou você não tem permissão para acessá-la.',
        };
      }

      const correcao = redacao.correcoesIA.id(correcaoId);

      if (!correcao) {
        return {
          success: false,
          status: 404,
          message: `Correção com id ${correcaoId} não foi encontrada.`,
        };
      }

      if (correcao.status !== EnumCorrecaoRedacaoStatus.Erro) {
        return {
          success: false,
          status: 409,
          message:
            'Apenas correções com status de "Erro" podem ser reenviadas.',
        };
      }

      const job = await CorrigirRedacaoQueue.getJob(correcaoId);
      const jobState = await job?.getState();

      if (!job || jobState !== 'failed') {
        return {
          success: false,
          status: 409,
          message:
            'A correção não está em um estado que permita uma nova tentativa.',
        };
      }

      const [primaryModel, fallbackModel] = await GetModelPriority();
      const primaryAvailable = await checkModelAvailability(primaryModel);
      const fallbackAvailable = await checkModelAvailability(fallbackModel);

      if (!primaryAvailable.success && !fallbackAvailable.success) {
        return {
          success: false,
          status: 409,
          message:
            'O serviço de correção está temporariamente indisponível devido à alta demanda. Por favor, tente novamente em alguns minutos.',
        };
      }

      await job.retry();

      correcao.set({ status: EnumCorrecaoRedacaoStatus.Pendente });
      await redacao.save();

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
