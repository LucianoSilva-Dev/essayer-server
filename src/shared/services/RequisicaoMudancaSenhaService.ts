import { randomBytes } from 'node:crypto';
import { RequisicaoMudancaSenhaModel } from '../models/RequisicaoMudancaSenhaModel';
import { createCodeEmail, Transporter } from '../Transporter';
import { EMAIL } from '../Env';
import { UsuarioModel } from '../models/UsuarioModel';

export const RequisicaoMudancaSenhaService = {
  create: async (id: string) => {
    const code = randomBytes(6).toString('base64');
    const usuario = await UsuarioModel.findById(id).select('email');

    if (!usuario) {
      return {
        succes: false,
        status: 404,
        message: `Usuário com id ${id} não existe.`,
      };
    }

    const req = await RequisicaoMudancaSenhaModel.create({
      requisitante: id,
      codigo: code,
    });

    Transporter.sendMail({
      from: `Incita <${EMAIL}>`,
      to: usuario?.email,
      subject: 'Mudança de Senha',
      html: createCodeEmail(code),
    });

    return {
      success: true,
      data: req._id.toString(),
    };
  },
  validate: async (id: string, code: string) => {
    const req = await RequisicaoMudancaSenhaModel.findById(id);

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

    return {
      success: true,
      message: 'Usuário autenticado.',
    };
  },
  get: async (id: string) => {
    const req = await RequisicaoMudancaSenhaModel.findById(id)
      .select('requisitante codigo')
      .populate('requisitante', 'nome');

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
