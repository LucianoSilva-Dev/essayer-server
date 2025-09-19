import type { Populate, PopulatedPerfilUsuario } from '../../shared/Types';
import { TurmaModel } from './Model';
import type {
  CreateTurmaBody,
  GetAlunosResponse,
  GetAtividadesResponse,
  GetTurmaResponse,
  GetTurmasCriadasResponse,
  GetTurmasResponse,
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

  getAll: async (userId: string) => {
    const turmas = await TurmaModel.find({
      membros: userId,
    })
      .populate<{ criador: PopulatedPerfilUsuario }>(
        'criador',
        '_id nome fotoPath',
      )
      .lean();

    const turmasResponse: GetTurmasResponse = turmas.map((turma) => {
      return {
        id: turma._id.toString(),
        criador: {
          id: turma.criador._id.toString(),
          nome: turma.criador.nome,
          fotoPath: turma.criador.fotoPath,
        },
        escola: turma.escola,
        nome: turma.nome,
      };
    });

    return { success: true, data: turmasResponse } as const;
  },

  getCriadas: async (userId: string) => {
    const turmas = await TurmaModel.find({ criador: userId })
      .select('_id nome escola')
      .lean<Pick<Turma, '_id' | 'nome' | 'escola'>[]>();

    const turmasCriadas: GetTurmasCriadasResponse = turmas.map((turma) => {
      return {
        id: turma._id.toString(),
        ...turma,
      };
    });

    return { success: true, data: turmasCriadas } as const;
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
          '_id' | 'nome' | 'escola' | 'criador' | 'membros'
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
      )
      .select('membros');

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
          ...membro,
        };
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

  getAllAtividades: async (turmaId: string, userId: string) => {
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

    const atividades = await AtividadeModel.find({ turma: turmaId })
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
