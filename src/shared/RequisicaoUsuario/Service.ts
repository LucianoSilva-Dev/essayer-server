import { RequisicaoUsuarioModel } from './Model';
import { UsuarioModel } from '../Usuario/Model';

export const RequisicaoUsuarioService = {
  validate: async (id: string, code: string) => {
    const req = await RequisicaoUsuarioModel.findById(id);

    if (!req) {
      return {
        success: false,
        status: 404,
        message: `Requisição com id ${id} não encontrada.`,
      };
    }

    if (code !== req.codigo) {
      return {
        success: false,
        status: 422,
        message: 'Código inválido.',
      };
    }

    const user = await UsuarioModel.create({
      nome: req.nome,
      senha: req.senha,
      email: req.email,
      cargo: 'aluno',
      requisicao: req._id,
    });

    return {
      success: true,
      message: user.id,
    };
  },
  get: async (id: string) => {
    const req = await RequisicaoUsuarioModel.findById(id)
      .select('nome senha email codigo')

    if (!req) {
      return {
        success: false,
        status: 404,
        message: `Requisição com id ${id} não existe`,
      };
    }

    return {
      success: true,
      data: req,
    };
  },
};
