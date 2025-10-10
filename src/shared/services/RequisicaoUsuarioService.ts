import { RequisicaoUsuarioModel } from '../models/RequisicaoUsuarioModel';
import { UsuarioModel } from '../models/UsuarioModel';

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

    await UsuarioModel.create({
      nome: req.nome,
      senha: req.senha,
      email: req.email,
      cargo: 'aluno',
      requisicao: req._id,
    });

    return {
      success: true,
      message: 'Usuário criado.',
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
