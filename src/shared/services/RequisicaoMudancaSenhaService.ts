import { randomBytes } from 'node:crypto';
import { RequisicaoMudancaSenhaModel } from '../models/RequisicaoMudancaSenhaModel';
import { Transporter } from '../Transporter';
import { EMAIL } from '../Env';
import { UsuarioModel } from '../models/UsuarioModel';

export const RequisicaoMudancaSenhaService = {
  create: async (email: string) => {
    const code = randomBytes(6).toString('base64');
    const usuario = await UsuarioModel.findOne({ email });
    
    if (!usuario) {
      return {
        succes: false,
        status: 404,
        message: `Usuário com email ${email} não existe.`,
      };
    }
    
    const requisicao = await RequisicaoMudancaSenhaModel.findOne({ requisitante: usuario.id });

    if (requisicao) {
      const config = {
        from: `Incita <${EMAIL}>`,
        to: usuario?.email,
        subject: 'Mudança de Senha',
        template: 'codigo',
        context: {
          codigo: requisicao.codigo,
        },
      };

      Transporter.sendMail(config);

      return {
        success: true,
        data: requisicao.id,
      };
    }

    const req = await RequisicaoMudancaSenhaModel.create({
      requisitante: usuario.id,
      codigo: code,
    });

    const config = {
      from: `Incita <${EMAIL}>`,
      to: usuario?.email,
      subject: 'Mudança de Senha',
      template: 'codigo',
      context: {
        codigo: code,
      },
    };

    Transporter.sendMail(config);

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
      await RequisicaoMudancaSenhaModel.findByIdAndUpdate(id, {
        $set: { status: 'recusado' },
      });

      return {
        success: false,
        status: 422,
        message: 'Código inválido.',
      };
    }

    await RequisicaoMudancaSenhaModel.findByIdAndUpdate(id, {
      $set: { status: 'aprovado' },
    });

    return {
      success: true,
      message: 'Usuário autenticado.',
    };
  },
  get: async (id: string) => {
    const req = await RequisicaoMudancaSenhaModel.findById(id)
      .select('requisitante codigo')
      .populate('requisitante', '_id nome');

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
