import type { PopulatedPerfilUsuario } from '../../shared/Types';
import { TurmaModel } from './Model';
import type {
  CreateTurmaBody,
  getAllAtividadesQueryBody,
  GetAllTurmaQueryBody,
  GetAlunosResponse,
  Turma,
  UpdateTurmaBody,
} from './Types';
import { Types } from 'mongoose';
import { gerarCodigoConvite } from './Helpers/gerarCodigoConvite';

export const TurmaService = {
  create: async (data: CreateTurmaBody, criadorId: string) => {
    try {
      const codigoConvite = await gerarCodigoConvite();

      const turma = new TurmaModel({
        ...data,
        criador: criadorId,
        codigoConvite,
      });
      await turma.save();
      return { success: true } as const;
    } catch (e) {
      console.log(e);
      return {
        success: false,
        status: 500,
        message: 'Internal Server Error',
      } as const;
    }
  },

  getAll: async (userId: string, queryBody: GetAllTurmaQueryBody) => {
    const [turmas, totalDocuments] = await Promise.all([
      TurmaModel.find({ membros: userId })
        .skip(queryBody.offset)
        .limit(queryBody.limit)
        .populate<{ criador: PopulatedPerfilUsuario }>(
          'criador',
          '_id nome fotoPath',
        )
        .lean(),

      TurmaModel.countDocuments({ membros: userId }),
    ]);

    const turmasResponse = turmas.map((turma) => {
      return {
        id: turma._id.toString(),
        criador: {
          id: turma.criador._id.toString(),
          nome: turma.criador.nome,
          fotoPath: turma.criador.fotoPath,
        },
        escola: turma.escola,
        nome: turma.nome,
        iconeId: turma.iconeId,
      };
    });

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
        documentos: turmasResponse,
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
  },

  getCriadas: async (userId: string, queryBody: GetAllTurmaQueryBody) => {
    const [turmas, totalDocuments] = await Promise.all([
      TurmaModel.find({ criador: userId })
        .skip(queryBody.offset)
        .limit(queryBody.limit)
        .select('_id nome escola iconeId')
        .lean<Pick<Turma, '_id' | 'nome' | 'escola' | 'iconeId'>[]>(),

      TurmaModel.countDocuments({ criador: userId }),
    ]);

    const turmasCriadas = turmas.map((turma) => {
      return {
        id: turma._id.toString(),
        ...turma,
      };
    });

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
        documentos: turmasCriadas,
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
  },

  getById: async (turmaId: string, id: string) => {
    const userId = new Types.ObjectId(id)

    const turmaSearch = await TurmaModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(turmaId),
          $or: [{ membros: userId }, { criador: userId }]
        }
      },
      {
        $lookup: {
          from: 'usuarios',
          localField: 'criador',
          foreignField: '_id',
          as: 'criador'
        }
      },
      { $unwind: '$criador' },
      {
        $lookup: {
          from: 'usuarios',
          localField: 'membros',
          foreignField: '_id',
          as: 'membros'
        }
      },
      {
        $project: {
          _id: 0,
          id: { $toString: '$_id' },
          nome: 1,
          escola: 1,
          iconeId: 1,
          criador: {
            id: { $toString: '$criador._id' },
            nome: '$criador.nome',
            fotoPath: '$criador.fotoPath'
          },
          membros: {
            $map: {
              input: '$membros',
              as: 'membro',
              in: {
                id: { $toString: '$$membro._id' },
                nome: '$$membro.nome',
                fotoPath: '$$membro.fotoPath'
              }
            }
          },
          totalMembros: { $size: '$membros' }
        }
      }
    ])

    const turma = turmaSearch[0];

    if (!turma) {
      return {
        success: false,
        status: 404,
        message: 'Turma não encontrada ou você não pode acessa-la.',
      } as const;
    }

    return { success: true, data: turma } as const;
  },

  update: async (turmaId: string, data: UpdateTurmaBody, userId: string) => {
    const turma = await TurmaModel.findOneAndUpdate(
      { _id: turmaId, criador: userId },
      data,
    ).lean();

    if (!turma) {
      return {
        success: false,
        status: 404,
        message:
          'Turma não encontrada ou você não tem permissão para editá-la.',
      } as const;
    }
    return { success: true } as const;
  },

  delete: async (turmaId: string, userId: string) => {
    const result = await TurmaModel.deleteOne({
      _id: turmaId,
      criador: userId,
    });
    if (result.deletedCount === 0) {
      return {
        success: false,
        status: 404,
        message:
          'Turma não encontrada ou você não tem permissão para excluí-la.',
      } as const;
    }
    return { success: true } as const;
  },

  solicitarEntrada: async (codigoConvite: string, alunoId: string) => {
    const turma = await TurmaModel.findOne({ codigoConvite });

    if (!turma) {
      return {
        success: false,
        status: 404,
        message: 'Código de convite inválido',
      } as const;
    }

    if (turma.membros.length >= 120) {
      return {
        success: false,
        status: 400,
        message: 'Turma já atingiu o limite máximo de participantes.',
      } as const;
    }

    const alunoObjectId = new Types.ObjectId(alunoId);
    if (
      turma.criador.toString() === alunoId ||
      turma.membros.includes(alunoObjectId) ||
      turma.alunosPendentes.includes(alunoObjectId)
    ) {
      return {
        success: false,
        status: 409,
        message: 'Você já é membro ou sua solicitação está pendente.',
      } as const;
    }
    turma.alunosPendentes.push(alunoObjectId);
    await turma.save();
    return { success: true } as const;
  },

  getPedidos: async (turmaId: string, userId: string) => {
    const turma = await TurmaModel.findOne({
      _id: turmaId,
      criador: userId,
    }).populate<{ alunosPendentes: PopulatedPerfilUsuario[] }>(
      'alunosPendentes',
      'id nome fotoPath',
    );

    if (!turma) {
      return {
        success: false,
        status: 404,
        message: 'Turma não encontrada ou você não pode acessa-la.',
      } as const;
    }
    return { success: true, data: turma.alunosPendentes } as const;
  },

  aprovarPedido: async (turmaId: string, alunoId: string, userId: string) => {
    const turma = await TurmaModel.findOne({ _id: turmaId, criador: userId });
    if (!turma) {
      return {
        success: false,
        status: 404,
        message: 'Turma não encontrada ou você não é o criador.',
      } as const;
    }

    if (turma.membros.length >= 120) {
      return {
        success: false,
        status: 400,
        message: 'Turma já atingiu o limite máximo de participantes.',
      } as const;
    }

    const alunoObjectId = new Types.ObjectId(alunoId);

    if (!turma.alunosPendentes.includes(alunoObjectId)) {
      return {
        success: false,
        status: 404,
        message: 'Aluno não encontrado na lista de solicitações pendentes.',
      } as const;
    }

    turma.alunosPendentes = turma.alunosPendentes.filter(
      (alunoPendente) => alunoPendente !== alunoObjectId,
    );
    turma.membros.push(alunoObjectId);
    await turma.save();
    return { success: true } as const;
  },

  recusarPedido: async (turmaId: string, alunoId: string, userId: string) => {
    const turma = await TurmaModel.findOneAndUpdate(
      { _id: turmaId, criador: userId },
      { $pull: { alunosPendentes: alunoId } },
    );
    if (!turma) {
      return {
        success: false,
        status: 404,
        message: 'Turma não encontrada ou você não é o criador.',
      } as const;
    }
    return { success: true } as const;
  },

  getAllAlunos: async (turmaId: string, userId: string) => {
    const turma = await TurmaModel.findOne({
      _id: turmaId,
      criador: userId,
    })
      .populate<{ membros: PopulatedPerfilUsuario[] }>(
        'membros',
        'id nome fotoPath',
      ).select('membros').lean()


    if (!turma) {
      return {
        success: false,
        status: 404,
        message: 'Turma não encontrada ou você não é o criador.',
      } as const;
    }

    const getAllAlunosResponse: GetAlunosResponse = turma.membros.map(
      (membro) => {
        return {
          id: membro._id.toString(),
          ...membro
        }
      },
    );

    return { success: true, data: getAllAlunosResponse } as const;
  },

  getCodigoConvite: async (turmaId: string, userId: string) => {
    const turma = await TurmaModel.findOne({ _id: turmaId, criador: userId });
    if (!turma) {
      return {
        success: false,
        status: 404,
        message: 'Turma não encontrada ou você não é o criador.',
      } as const;
    }
    return {
      success: true,
      data: { codigoConvite: turma.codigoConvite },
    } as const;
  },

  regenerarCodigoConvite: async (turmaId: string, userId: string) => {
    try {
      const codigo = await gerarCodigoConvite();

      const turma = await TurmaModel.findOneAndUpdate(
        { _id: turmaId, criador: userId },
        { codigoConvite: codigo },
      );
      if (!turma) {
        return {
          success: false,
          status: 404,
          message: 'Turma não encontrada ou você não pode acessa-la.',
        } as const;
      }
      return { success: true, data: { codigo } } as const;
    } catch (e) {
      console.log(e);
      return {
        success: false,
        status: 500,
        message: 'Internal Server Error',
      } as const;
    }
  },

  getAllAtividades: async (
    turmaId: string,
    userId: string,
    queryBody: getAllAtividadesQueryBody,
  ) => {
    try {
      const id = new Types.ObjectId(userId)

      const filtro = queryBody.titulo
        ? { 'atividades.titulo': new RegExp(queryBody.titulo, 'i') }
        : {};

      const atividades = await TurmaModel.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(turmaId),
            membros: id
          }
        },
        {
          $lookup: {
            from: 'atividades',
            localField: '_id',
            foreignField: 'turma',
            as: 'atividades'
          }
        },
        { $unwind: '$atividades' },
        { $match: filtro },
        {
          $addFields: {
            respostasEnviadas: {
              $filter: {
                input: '$atividades.respostas',
                as: 'resp',
                cond: {
                  $and: [{ $eq: ['$$resp.aluno', id] }, { $ifNull: ['$$resp.dataEnvio', false] }]
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
            }
          }
        }
      ])

      return { success: true, data: atividades } as const;
    } catch (e) {
      console.log(e);
      return {
        success: false,
        status: 500,
        message: 'Internal Server Error',
      }
    }
  },

  getAllAtividadesCriador: async (
    turmaId: string,
    userId: string,
    queryBody: getAllAtividadesQueryBody,
  ) => {
    try {
      const id = new Types.ObjectId(userId)

      const filtro = queryBody.titulo
        ? { 'atividades.titulo': new RegExp(queryBody.titulo, 'i') }
        : {};

      const atividades = await TurmaModel.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(turmaId),
            criador: id
          }
        },
        {
          $lookup: {
            from: 'atividades',
            localField: '_id',
            foreignField: 'turma',
            as: 'atividades'
          }
        },
        { $unwind: '$atividades' },
        { $match: filtro },
        {
          $addFields: {
            usuariosResponderam: {
              $filter: {
                input: '$atividades.respostas',
                as: 'resp',
                cond: { $ifNull: ['$$resp.dataEnvio', false] }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'usuarios',
            localField: 'usuariosResponderam.aluno',
            foreignField: '_id',
            as: 'usuariosResponderam'
          }
        },
        {
          $project: {
            id: { $toString: '$atividades._id' },
            titulo: '$atividades.titulo',
            descricao: '$atividades.descricao',
            dataLimite: '$atividades.dataLimite',
            tipoAtividade: '$atividades.tipoAtividade',
            usuariosResponderam: {
              $map: {
                input: '$usuariosResponderam',
                as: 'usuario',
                in: {
                  id: { $toString: '$$usuario._id' },
                  nome: '$$usuario.nome',
                  fotoPath: '$$usuario.fotoPath'
                }
              }
            }
          }
        }
      ])

      return { success: true, data: atividades } as const;
    } catch (e) {
      console.log(e);
      return {
        success: false,
        status: 500,
        message: 'Internal Server Error',
      }
    }
  },

  removerAluno: async (turmaId: string, alunoId: string, userId: string) => {
    const turma = await TurmaModel.findOneAndUpdate(
      { _id: turmaId, criador: userId },
      { $pull: { membros: alunoId } },
    );

    if (!turma) {
      return {
        success: false,
        status: 404,
        message: 'Turma não encontrada ou você não é o criador.',
      } as const;
    }
    return { success: true } as const;
  },

  getAllFeedbacks: async (turmaId: string, userId: string) => {
    try {
      const respostas = await TurmaModel.aggregate([
        { $match: { _id: new Types.ObjectId(turmaId), membros: new Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'atividades',
            localField: '_id',
            foreignField: 'turma',
            as: 'atividades'
          }
        },
        { $unwind: '$atividades' },
        { $unwind: '$atividades.respostas' },
        { $match: { 'atividades.respostas.feedback': { $exists: true }, 'atividades.respostas.aluno': new Types.ObjectId(userId) } },
        {
          $project: {
            _id: 0,
            id: { $toString: '$atividades.respostas.feedback._id' },
            feedback: '$atividades.respostas.feedback.texto',
            visto: '$atividades.respostas.feedback.visto',
            data: '$atividades.respostas.feedback.createdAt',
            atividade: {
              id: { $toString: '$atividades._id' },
              titulo: '$atividades.titulo',
              tipoAtividade: '$atividades.tipoAtividade'
            }
          }
        }
      ])

      return { success: true, data: respostas } as const;
    } catch (e) {
      console.log(e);
      return {
        success: false,
        status: 500,
        message: 'Internal Server Error',
      }
    }
  }
};
