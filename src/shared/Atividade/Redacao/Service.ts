import { Types } from 'mongoose';
import { RedacaoAtividadeModel } from './Model';
import type {
  CreateRedacaoBody,
  getAllRespostasRedacaoQueryBody,
  UpdateRedacaoBody,
} from './Types';
import { TurmaModel } from '../../../features/Turmas/Model';
import type {
  TarefaCorrigidaEventPayload,
  TarefaEnviadaEventPayload,
} from '../../Events/Types';

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
        remetentes: turma.membros.map((id) => id.toString()),
      };

      return {
        success: true,
        data: notificacaoPayload,
      } as const;
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
      const atividade = await RedacaoAtividadeModel.findById(id)
        .select({
          respostas: { aluno: 1, dataEnvio: 1, _id: 1 },
        })
        .populate('turma', 'criador');

      const resposta = atividade?.respostas.find(
        (res) => res.aluno.toString() === requisitante,
      );

      if (!atividade || resposta?.dataEnvio) {
        return {
          success: false,
          status: 404,
          message: 'Resposta não existe ou já foi enviada.',
        };
      }

      await RedacaoAtividadeModel.findOneAndUpdate(
        { _id: id, 'respostas.aluno': requisitante },
        {
          $set: {
            'respostas.$.texto': texto,
            'respostas.$.dataEnvio': Date.now(),
          },
        },
      );

      const notificacaoPayload: TarefaEnviadaEventPayload = {
        atividade,
        remetentes: [atividade.turma.criador.toString()],
      };

      return { success: true, data: notificacaoPayload };
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
      }).populate('turma', '_id nome criador membros');

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

      const resposta = atividade.respostas.find(
        (res) => res.id.toString() === id,
      );

      const notificacaoPayload: TarefaCorrigidaEventPayload = {
        atividade,
        remetentes: resposta ? [resposta.aluno.toString()] : [],
      };

      return { success: true, data: notificacaoPayload };
    } catch (e) {
      console.log(e);
      return {
        success: false,
        status: 500,
        message: 'Internal Server Error',
      };
    }
  },
  getAllRespostasRedacao: async (
    id: string,
    requisitante: string,
    queryBody: getAllRespostasRedacaoQueryBody,
  ) => {
    const ativs = await RedacaoAtividadeModel.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },
      {
        $project: {
          turma: 1,
          respostasEnviadas: {
            $filter: {
              input: '$respostas',
              as: 'resp',
              cond: { $ifNull: ['$$resp.dataEnvio', false] },
            },
          },
        },
      },
      {
        $project: {
          turma: 1,
          respostasEnviadas: 1,
          totalResp: { $size: '$respostasEnviadas' },
        },
      },
      {
        $unwind: {
          path: '$respostasEnviadas',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'usuarios',
          localField: 'respostasEnviadas.aluno',
          foreignField: '_id',
          as: 'alunoInfo'
        }
      },
      { $skip: queryBody.offset },
      { $limit: queryBody.limit },
    ]);

    console.log("\n\n\n\n\n ======================================= \n\n\n\n\n");
    console.dir(ativs, {depth: null});
    console.log("\n\n\n\n\n ======================================= \n\n\n\n\n");

    const turma = await TurmaModel.findById(ativs[0].turma);

    if (!turma || turma?.criador.toString() !== requisitante) {
      return {
        success: false,
        status: 403,
        message:
          'Você não tem permissão para acessar essa turma ou a turma não existe.',
      };
    }

    const totalDocuments = ativs[0].totalResp;

    const respostas = ativs[0].respostasEnviadas
      ? ativs.map((resp) => {
          return {
            ...resp.respostasEnviadas,
            _id: resp.respostasEnviadas._id.toString(),
            aluno: {id: resp.alunoInfo[0]._id.toString(), ...resp.alunoInfo[0]}
          };
        })
      : [];

    const nextOffset = Math.min(
      queryBody.offset + queryBody.limit,
      totalDocuments,
    );
    const prevOffset = Math.max(queryBody.offset - queryBody.limit, 0);

    console.log(respostas);

    return {
      success: true,
      data: {
        documentos: respostas,
        paginacao: {
          offset: queryBody.offset,
          limit: queryBody.limit,
          nextPageUrl:
            nextOffset >= totalDocuments
              ? null
              : `/offset=${nextOffset}&limit=${queryBody.limit}`,
          previousPageUrl:
            // biome-ignore lint/suspicious/noDoubleEquals: Embora o tipo seja 'number', o offset é uma string(?)
            queryBody.offset == 0
              ? null
              : `/offset=${prevOffset}&limit=${queryBody.limit}`,
          totalDocuments,
        },
      },
    } as const;
  },
};
