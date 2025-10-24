import { Types } from 'mongoose';
import { TurmaModel } from '../../../features/Turmas/Model';
import type {
  TarefaCorrigidaEventPayload,
  TarefaEnviadaEventPayload,
} from '../../Events/Types';
import { RedacaoAtividadeModel } from './Model';
import type {
  CreateRedacaoBody,
  FeedbackRedacaoBody,
  getAllRespostasRedacaoQueryBody,
  UpdateRedacaoBody,
} from './Types';

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
    try {
      const atv = await RedacaoAtividadeModel.aggregate([
        { $match: { _id: new Types.ObjectId(id) } },
        {
          $lookup: {
            from: 'turmas',
            localField: 'turma',
            foreignField: '_id',
            as: 'turmas'
          }
        },
        { $unwind: '$turmas' },
        {
          $project: {
            _id: 0,
            id: { $toString: '$_id' },
            titulo: 1,
            descricao: 1,
            dataLimite: 1,
            tema: 1,
            tempoLimiteEmMinutos: 1,
            repertoriosApoio: {
              $map: {
                input: '$repertoriosApoio',
                as: 'rep',
                in: { $toString: '$$rep' }
              }
            },
            respostas: {
              $map: {
                input: '$respostas',
                as: 'resp',
                in: {
                  id: { $toString: '$$resp._id' },
                  aluno: { $toString: '$$resp.aluno' },
                  texto: '$$resp.texto',
                  dataEnvio: '$$resp.dataEnvio',
                  feedback: {
                    notaC1: '$$resp.feedback.notaC1',
                    notaC2: '$$resp.feedback.notaC2',
                    notaC3: '$$resp.feedback.notaC3',
                    notaC4: '$$resp.feedback.notaC4',
                    notaC5: '$$resp.feedback.notaC5',
                    feedbackC1: '$$resp.feedback.feedbackC1',
                    feedbackC2: '$$resp.feedback.feedbackC2',
                    feedbackC3: '$$resp.feedback.feedbackC3',
                    feedbackC4: '$$resp.feedback.feedbackC4',
                    feedbackC5: '$$resp.feedback.feedbackC5',
                  },
                }
              },
            },
            turma: {
              id: { $toString: '$turmas._id' },
              nome: '$turmas.nome',
              criador: { $toString: '$turmas.criador' },
              membros: '$turmas.membros'
            },
          }
        }
      ])

      const atividade = atv[0]

      if (!atividade) {
        return {
          success: false,
          status: 404,
          message: `Atividade com o id ${id} não existe.`,
        };
      }

      if (
        atividade.turma.criador !== requisitante &&
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
    } catch (e) {
      console.log(e); return {
        success: false,
        status: 500,
        message: 'Internal Server Error',
      };
    }

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
  feedback: async (id: string, feedback: FeedbackRedacaoBody, requisitante: string) => {
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
  updateFeedbackStatus: async (id: string, requisitante: string) => {
    try {
      const atividade = await RedacaoAtividadeModel.findById(id);

      if (!atividade) return {
        success: false,
        status: 404,
        message: 'A atividade solicitada não existe.'
      }

      const resposta = atividade.respostas.find(
        (res) => res.aluno._id.toString() === requisitante,
      );

      if (!resposta || !resposta.feedback) return {
        success: false,
        status: 404,
        message: 'A atividade não possui uma resposta do aluno ou um feedback do professor.'
      }

      resposta.feedback.visto = true

      await atividade.save()

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
  getAllRespostasRedacao: async (
    id: string,
    requisitante: string,
    queryBody: getAllRespostasRedacaoQueryBody,
  ) => {
    try {
      const ativs = await RedacaoAtividadeModel.aggregate([
        { $match: { _id: new Types.ObjectId(id) } },
        {
          $addFields: {
            respostasEnviadas: {
              $filter: {
                input: '$respostas',
                as: 'resp',
                cond: { $ifNull: ['$$resp.dataEnvio', false] },
              },
            }
          }
        },
        {
          $project: {
            turma: 1,
            respostasEnviadas: 1,
            totalResp: {
              $size: '$respostasEnviadas'
            },
          },
        },
        {
          $unwind: {
            path: '$respostasEnviadas',
            preserveNullAndEmptyArrays: true,
          },
        },
        { $skip: queryBody.offset },
        { $limit: queryBody.limit },
        {
          $lookup: {
            from: 'usuarios',
            localField: 'respostasEnviadas.aluno',
            foreignField: '_id',
            as: 'alunoInfo'
          }
        },
        { $unwind: '$alunoInfo' },
        {
          $lookup: {
            from: 'turmas',
            localField: 'turma',
            foreignField: '_id',
            as: 'turmaInfo'
          }
        },
        { $unwind: '$turmaInfo' },
        {
          $project: {
            _id: 0,
            id: { $toString: '$respostasEnviadas._id' },
            texto: '$respostasEnviadas.texto',
            dataEnvio: '$respostasEnviadas.dataEnvio',
            feedback: {
              notaC1: '$respostasEnviadas.feedback.notaC1',
              notaC2: '$respostasEnviadas.feedback.notaC2',
              notaC3: '$respostasEnviadas.feedback.notaC3',
              notaC4: '$respostasEnviadas.feedback.notaC4',
              notaC5: '$respostasEnviadas.feedback.notaC5',
              feedbackC1: '$respostasEnviadas.feedback.feedbackC1',
              feedbackC2: '$respostasEnviadas.feedback.feedbackC2',
              feedbackC3: '$respostasEnviadas.feedback.feedbackC3',
              feedbackC4: '$respostasEnviadas.feedback.feedbackC4',
              feedbackC5: '$respostasEnviadas.feedback.feedbackC5',
            },
            aluno: {
              id: { $toString: '$alunoInfo._id' },
              nome: '$alunoInfo.nome',
              fotoPath: '$alunoInfo.fotoPath',
            },
            criador: { $toString: '$turmaInfo.criador' },
            totalResp: 1,
            createdAt: '$respostasEnviadas.createdAt',
            tempoEmMinutos: { $divide: [{ $subtract: ['$respostasEnviadas.dataEnvio', '$respostasEnviadas.createdAt'] }, 1000 * 60] },
          }
        }
      ]);

      const atividade = ativs[0];

      if (ativs.length == 0) {
        return {
          success: true,
          data: {
            documentos: [],
            paginacao: {
              offset: queryBody.offset,
              limit: queryBody.limit,
              nextPageUrl: null,
              previousPageUrl: null,
              totalDocuments: 0,
              pagesUrl: []
            }
          }
        }
      }

      if (atividade.criador !== requisitante) {
        return {
          success: false,
          status: 403,
          message:
            'Você não tem permissão para acessar essa turma ou a turma não existe.',
        };
      }

      const totalDocuments = atividade.totalResp;

      const nextOffset = Math.min(
        queryBody.offset + queryBody.limit,
        totalDocuments,
      );
      const prevOffset = Math.max(queryBody.offset - queryBody.limit, 0);

      const totalPages = Math.ceil(totalDocuments / queryBody.limit)
      const pages = Array.from({ length: totalPages }, (_, i) => `offset=${i * queryBody.limit}&limit=${queryBody.limit}`)

      return {
        success: true,
        data: {
          documentos: ativs,
          paginacao: {
            offset: queryBody.offset,
            limit: queryBody.limit,
            nextPageUrl:
              nextOffset >= totalDocuments
                ? null
                : `/offset=${nextOffset}&limit=${queryBody.limit}`,
            previousPageUrl:
              queryBody.offset === 0
                ? null
                : `/offset=${prevOffset}&limit=${queryBody.limit}`,
            totalDocuments,
            pagesUrl: pages
          },
        },
      } as const;
    } catch (e) {
      console.log(e); return {
        success: false,
        status: 500,
        message: 'Internal Server Error',
      };
    }
  },
};
