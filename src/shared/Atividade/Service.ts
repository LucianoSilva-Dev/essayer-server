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
};
