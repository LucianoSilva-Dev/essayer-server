import { Types } from 'mongoose';
import { TurmaModel } from '../../features/Turmas/Model';
import { AtividadeModel } from './Model';

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
            membros: 1, 
            atividades: 1,
            respostasEnviadas: {
              $filter: {
                input: '$atividades.respostas',
                as: 'resp',
                cond: {
                  $ifNull: ['$$resp.dataEnvio', false]
                }
              }
            }
          }
        },
        {
          $project: {
            _id: '$atividades._id',
            titulo: '$atividades.titulo',
            descricao: '$atividades.descricao',
            respostas: { $size: '$respostasEnviadas' },
            createdAt: '$atividades.createdAt',
            totalAlunos: { $size: '$membros' }
          }
        }
      ])

      const formatedAtivs = atividades.map((atividade) => {
        return {
          id: atividade._id.toString(),
          ...atividade
        }
      })

      return { success: true, data: formatedAtivs }
    } catch (e) {
      console.log(e)
      return {
        success: false,
        status: 500,
        message: 'Internal Server Error',
      };
    }
  }
};
