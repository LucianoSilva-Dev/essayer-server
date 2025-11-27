import { RequisicaoEmailModel } from './Model';
import { randomBytes } from 'node:crypto';
import { Transporter } from '../Transporter';
import { EMAIL } from '../Env';
import { UsuarioModel } from '../Usuario/Model';

export const RequisicaoEmailService = {
  validate: async (id: string, code: string) => {
    const req = await RequisicaoEmailModel.findById(id);

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

    await UsuarioModel.findByIdAndUpdate(req.requisitante, {
      email: req.email
    })
    return {
      success: true,
      message: 'Email atualizado.',
    };
  },
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

    const requisicao = await RequisicaoEmailModel.findOne({ requisitante: usuario.id });

    if (requisicao) {
      const config = {
        from: `Incita <${EMAIL}>`,
        to: usuario?.email,
        subject: 'Mudança de Email',
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

    const req = await RequisicaoEmailModel.create({
      requisitante: usuario.id,
      codigo: code,
      email
    });

    const config = {
      from: `Incita <${EMAIL}>`,
      to: usuario?.email,
      subject: 'Mudança de Email',
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
  }
}
