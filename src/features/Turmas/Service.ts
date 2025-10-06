import type { Populate, PopulatedPerfilUsuario } from '../../shared/Types';
import { TurmaModel } from './Model';
import type {
  CreateTurmaBody,
  getAllAtividadesQueryBody,
  GetAllTurmaQueryBody,
  GetAlunosResponse,
  GetAtividadesResponse,
  GetTurmaResponse,
  Turma,
  UpdateTurmaBody,
} from './Types';
import { Types } from 'mongoose';
import { gerarCodigoConvite } from './Helpers/gerarCodigoConvite';
import { AtividadeModel } from '../../shared/Atividade/Model';
import type { Atividade } from '../../shared/Atividade/Types';

export const TurmaService = {
  create: async (data: CreateTurmaBody, criadorId: string) => {
    try {
      const codigoConvite = gerarCodigoConvite();

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

  getById: async (turmaId: string, userId: string) => {
    const turma = await TurmaModel.findOne({
      _id: turmaId,
      $or: [{ membros: userId }, { criador: userId }],
    })
      .populate<{
        criador: PopulatedPerfilUsuario;
        membros: PopulatedPerfilUsuario[];
      }>(['criador', 'membros'])
      .lean<
        Pick<
          Populate<
            Turma,
            {
              criador: PopulatedPerfilUsuario;
              membros: PopulatedPerfilUsuario[];
            }
          >,
          '_id' | 'nome' | 'escola' | 'criador' | 'membros' | 'iconeId'
        >
      >();

    if (!turma) {
      return {
        success: false,
        status: 404,
        message: 'Turma não encontrada ou você não pode acessa-la.',
      } as const;
    }

    const getTurmaByIdResponse: GetTurmaResponse = {
      ...turma,
      id: turma._id.toString(),
      criador: {
        id: turma.criador._id.toString(),
        ...turma.criador,
      },
      membros: turma.membros.map((membro) => {
        return {
          id: membro._id.toString(),
          ...membro,
        };
      }),
    };

    return { success: true, data: getTurmaByIdResponse } as const;
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
      const codigo = gerarCodigoConvite();

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
    const isMember = await TurmaModel.exists({
      _id: turmaId,
      $or: [{ membros: userId }, { criador: userId }],
    });
    if (!isMember) {
      return {
        success: false,
        status: 404,
        message: 'Turma não encontrada ou você não pode acessa-la.',
      } as const;
    }

    const filtro = queryBody.titulo
      ? { turma: turmaId, titulo: new RegExp(queryBody.titulo, 'i') }
      : { turma: turmaId };

    const atividades = await AtividadeModel.find(filtro)
      .select('_id tipoAtividade titulo descricao dataLimite')
      .lean<
        Pick<
          Atividade,
          '_id' | 'tipoAtividade' | 'titulo' | 'descricao' | 'dataLimite'
        >[]
      >();

    const atividadesResponse: GetAtividadesResponse = atividades.map(
      (atividade) => {
        return {
          ...atividade,
          id: atividade._id.toString(),
          dataLimite: atividade.dataLimite
            ? atividade.dataLimite.toISOString()
            : null,
        };
      },
    );

    return { success: true, data: atividadesResponse } as const;
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
};
