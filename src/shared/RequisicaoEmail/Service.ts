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
  create: async (id: string, email: string) => {
    const code = randomBytes(6).toString('base64');
    const usuario = await UsuarioModel.findOne({ email });

    if (usuario) {
      return {
        succes: false,
        status: 409,
        message: `Usuário com email ${email} já existe.`,
      };
    }

    const requisicao = await RequisicaoEmailModel.findOne({ email });

    let config = {}
    let returnId = requisicao ? requisicao.id : ""

    if (!requisicao) {
      const req = await RequisicaoEmailModel.create({
        requisitante: id,
        codigo: code,
        email
      });

      config = {
        from: `Incita <${EMAIL}>`,
        to: email,
        subject: 'Mudança de Email',
        template: 'codigo',
        context: {
          codigo: code,
        },
      };

      returnId = req._id.toString()
    }
    else if (Date.now() - new Date(requisicao.updatedAt).getTime() > 1000 * 60 * 5) {
      await RequisicaoEmailModel.findOneAndUpdate({ email }, {
        codigo: code
      })

      config = {
        from: `Incita <${EMAIL}>`,
        to: email,
        subject: 'Mudança de Email',
        template: 'codigo',
        context: {
          codigo: code,
        },
      };
    }
    else {
      config = {
        from: `Incita <${EMAIL}>`,
        to: email,
        subject: 'Mudança de Email',
        template: 'codigo',
        context: {
          codigo: requisicao.codigo,
        },
      };
    }

    Transporter.sendMail(config);

    return {
      success: true,
      data: returnId,
    };
  }
}
