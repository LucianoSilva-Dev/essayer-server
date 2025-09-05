import { Types } from 'mongoose';
import { RedacaoAtividadeModel } from './Model';
import type { CreateRedacaoBody, UpdateRedacaoBody } from './Types';
import { TurmaModel } from '../../../features/Turmas/Model';
import { TarefaEnviadaEventPayload } from '../../Events/Types';

export const RedacaoService = {
  create: async (data: CreateRedacaoBody, requisitante: string) => {
    try {
      const turma = await TurmaModel.findById(data.turma);

      if (!turma || turma.criador.toString() !== requisitante) {
        return {
          success: false,
          status: 403,
          message:
            'Turma não existe ou você não tem permissão para criar uma atividade nela.',
        } as const;
      }

      const atividade = await RedacaoAtividadeModel.create(data);
      const notificacaoPayload: TarefaEnviadaEventPayload = {
        atividade,
        remetentes: turma.membros
      }

      return {
        success: true,
        data: notificacaoPayload
      } as const
      
    } catch (e) {
      console.log(e);
      return {
        success: false,
        status: 500,
        message: 'Internal Server Error',
      };
    }
  },
  get: async (id: string, requisitante: string) => {
    const atividade = await RedacaoAtividadeModel.findById(id)
      .select(
        'titulo descricao dataLimite turma tema tempoLimiteEmMinutos repertoriosApoio respostas',
      )
      .populate('turma', 'id nome criador membros')
      .populate('respostas', 'id aluno texto dataEnvio');

    if (!atividade) {
      return {
        success: false,
        status: 404,
        message: `Atividade com o id ${id} não existe.`,
      };
    }

    if (
      atividade.turma.criador.toString() !== requisitante &&
      !atividade.turma.membros.includes(new Types.ObjectId(requisitante))
    ) {
      return {
        success: false,
        status: 403,
        message: 'Você não tem permissão para visualizar essa atividade.',
      };
    }

    return {
      success: true,
      data: atividade,
    };
  },
  update: async (id: string, data: UpdateRedacaoBody, requisitante: string) => {
    try {
      const atividade = await RedacaoAtividadeModel.findById(id).populate(
        'turma',
        'criador',
      );

      if (!atividade || atividade.turma.criador.toString() !== requisitante) {
        return {
          success: false,
          status: 404,
          message: `Atividade com id ${id} não existe ou você não tem permissão para editá-la.`,
        };
      }

      await RedacaoAtividadeModel.findByIdAndUpdate(id, data);

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
  start: async (id: string, requisitante: string) => {
    try {
      const atividade = await RedacaoAtividadeModel.findById(id)
        .populate('turma', 'membros')
        .populate('respostas', 'aluno');

      if (
        !atividade ||
        !atividade.turma.membros.includes(new Types.ObjectId(requisitante)) ||
        atividade.respostas.find(
          (resp) => resp.aluno.toString() === requisitante,
        )
      ) {
        return {
          success: false,
          status: 404,
          message: `Atividade com id ${id} não existe, é inacessível ou já foi respondida.`,
        };
      }

      await RedacaoAtividadeModel.findByIdAndUpdate(id, {
        $push: { respostas: { aluno: requisitante } },
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
  send: async (id: string, texto: string, requisitante: string) => {
    try {
      const atividade = await RedacaoAtividadeModel.findById(id).select({
        respostas: { aluno: requisitante },
      });

      if (!atividade || !atividade.respostas[0].dataEnvio) {
        return {
          success: false,
          status: 404,
          message: 'Resposta não existe ou já foi enviada.',
        };
      }

      await RedacaoAtividadeModel.updateOne(
        { _id: id, 'respostas.aluno': requisitante },
        {
          $set: {
            'respostas.$.texto': texto,
            'respostas.$.dataEnvio': Date.now(),
          },
        },
      );

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
  feedback: async (id: string, feedback: string, requisitante: string) => {
    try {
      const atividade = await RedacaoAtividadeModel.findOne({
        'respostas._id': id,
      }).populate('turma', 'criador');

      if (!atividade || atividade.turma.criador.toString() !== requisitante) {
        return {
          success: false,
          status: 404,
          message:
            'Resposta não existe ou você não tem permissão para acessá-la.',
        };
      }

      await RedacaoAtividadeModel.updateOne(
        { 'respostas._id': id },
        { $set: { 'respostas.$.feedback': feedback } },
      );

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
