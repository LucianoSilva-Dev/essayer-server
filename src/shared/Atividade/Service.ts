import { Types } from 'mongoose';
import { TurmaModel } from '../../features/Turmas/Model';
import { AtividadeModel } from './Model';
import { RedacaoAtividadeModel } from './Redacao/Model';

export const AtividadeService = {
  delete: async (id: string, requisitante: string) => {
    const atividade = await AtividadeModel.findById(id).populate(
      'turma',
      'criador',
    );

    if (!atividade || atividade.turma.criador.toString() !== requisitante) {
      return {
        success: false,
        status: 404,
        message:
          'Atividade não existe ou você não tem permissão para excluí-la.',
      };
    }

    await AtividadeModel.findByIdAndDelete(id);

    return { success: true };
  },

  recentes: async (professor: string) => {
    try {
      const atividades = await TurmaModel.aggregate([
        { $match: { criador: new Types.ObjectId(professor) } },
        {
          $lookup: {
            from: 'atividades',
            localField: '_id',
            foreignField: 'turma',
            as: 'atividades'
          }
        },
        { $unwind: '$atividades' },
        { $sort: { 'atividades.createdAt': -1 } },
        { $limit: 4 },
        {
          $project: {
            id: { $toString: '$atividades._id' },
            titulo: '$atividades.titulo',
            descricao: '$atividades.descricao',
            respostas: {
              $size: {
                $filter: {
                  input: '$atividades.respostas',
                  as: 'resp',
                  cond: {
                    $ifNull: ['$$resp.dataEnvio', false]
                  }
                }
              }
            },
            createdAt: '$atividades.createdAt',
            totalAlunos: { $size: '$membros' }
          }
        }
      ])

      return { success: true, data: atividades }
    } catch (e) {
      console.log(e)
      return {
        success: false,
        status: 500,
        message: 'Internal Server Error',
      };
    }
  },

  getAllAtividadesAluno: async (id: string) => {
    try {
      const atividades = await TurmaModel.aggregate([
        { $match: { membros: new Types.ObjectId(id) } },
        {
          $lookup: {
            from: 'atividades',
            localField: '_id',
            foreignField: 'turma',
            as: 'atividades'
          }
        },
        { $unwind: '$atividades' },
        {
          $addFields: {
            respostasEnviadas: {
              $filter: {
                input: '$atividades.respostas',
                as: 'resp',
                cond: {
                  $and: [{ $eq: ['$$resp.aluno', new Types.ObjectId(id)] }, { $ifNull: ['$$resp.dataEnvio', false] }]
                }
              }
            }
          }
        },
        {
          $project: {
            id: { $toString: '$atividades._id' },
            titulo: '$atividades.titulo',
            descricao: '$atividades.descricao',
            dataLimite: '$atividades.dataLimite',
            tipoAtividade: '$atividades.tipoAtividade',
            status: {
              $switch: {
                branches: [
                  // biome-ignore lint/suspicious/noThenProperty: É a sintaxe do $switch
                  { case: { $gt: [{ $size: '$respostasEnviadas' }, 0] }, then: 'Concluída' },
                  // biome-ignore lint/suspicious/noThenProperty: É a sintaxe do $switch
                  { case: { $or: [{ $not: { $ifNull: ['$atividades.dataLimite', false] } }, { $gt: ['$atividades.dataLimite', new Date()] }] }, then: 'Pendente' },
                ],
                default: "Encerrada"
              }
            },
            turma: {
              id: { $toString: '$_id' },
              nome: '$nome',
              iconeId: '$iconeId'
            }
          }
        }
      ])  

      return { success: true, data: atividades }
    } catch (e) {
      console.log(e)
      return {
        success: false,
        status: 500,
        message: 'Internal Server Error',
      };
    }
  },

  getCorrecaoRedacao: async (id: string, requisitante: string) => {
    const ativs = await RedacaoAtividadeModel.aggregate([
      {$match: {_id: new Types.ObjectId(id)}},
      {
        $unwind: {
          path: '$respostas',
          preserveNullAndEmptyArrays: true
        }
      },
      {$match: {'respostas.aluno': new Types.ObjectId(requisitante)}},
      {
        $project: {
          _id: 0,
          id: {$toString: '$respostas._id'},
          titulo: 1,
          tema: 1,
          texto: '$respostas.texto',
          feedback: '$respostas.feedback'
        }
      }
    ])

    const atividade = ativs[0]

    if (!atividade) {
      return {
        success: false,
        status: 404,
        message: 'Atividade não encontrada',
      };
    }

    return {
      success: true,
      data: atividade
    }
  }
}