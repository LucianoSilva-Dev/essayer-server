import { UsuarioModel } from '../models/UsuarioModel';
import crypto from 'bcryptjs';
import type { createUsuarioBody, updateUsuarioBody } from '../Types';
import { RequisicaoProfessorModel } from '../models/RequisicaoProfessorModel';
import type { SavedMultipartFile } from '@fastify/multipart';
import { Transporter } from '../Transporter';
import { EMAIL } from '../Env';
import { RequisicaoUsuarioModel } from '../models/RequisicaoUsuarioModel';
import { randomBytes } from 'node:crypto';
import { RequisicaoMudancaSenhaModel } from '../models/RequisicaoMudancaSenhaModel';
import { cloudinary } from '../../config/cloudinary';

export const UsuarioService = {
  get: async (id: string) => {
    const usuario = await UsuarioModel.findById(id).select(
      'nome email senha cargo lattes createdAt',
    );

    if (!usuario) {
      return {
        success: false,
        status: 404,
        message: `Usuário com id ${id} não existe.`,
      };
    }

    return {
      success: true,
      data: usuario,
    };
  },

  create: async (usuarioData: createUsuarioBody) => {
    const { nome, email, senha } = usuarioData;

    const usuario = await UsuarioModel.findOne({ email });
    const requisicao = await RequisicaoUsuarioModel.findOne({ email });

    const hashedSenha = crypto.hashSync(senha, 10);
    const code = randomBytes(6).toString('base64');

    if (usuario) {
      return {
        success: false,
        status: 409,
        message: 'Usuário já existe.',
      };
    }

    if (requisicao) {
      const config = {
        from: `Incita <${EMAIL}>`,
        to: email,
        subject: 'Cadastro Incita',
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

    const req = await RequisicaoUsuarioModel.create({
      nome,
      email,
      senha: hashedSenha,
      codigo: code,
    });

    const config = {
      from: `Incita <${EMAIL}>`,
      to: email,
      subject: 'Cadastro Incita',
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

  professorCreate: async (id: string, lattes: string) => {
    const usuario = await UsuarioModel.findById(id).select('email');

    if (!usuario) {
      return {
        success: false,
        status: 404,
        message: `Usuário com id ${id} não existe.`,
      };
    }

    await RequisicaoProfessorModel.create({
      lattes: lattes,
      requisitante: id,
    });

    const config = {
      from: `Incita <${EMAIL}>`,
      to: usuario.email,
      subject: 'Requisição Recebida!',
      template: 'notificacao',
    };

    Transporter.sendMail(config);

    return { success: true, message: 'Requisição criada com sucesso.' };
  },

  update: async (id: string, usuarioData: updateUsuarioBody) => {
    const { email } = usuarioData;

    if (email) {
      const userEmail = await UsuarioModel.findOne({ email: email.toLocaleLowerCase() });
      if (userEmail && userEmail.id !== id) {
        return {
          success: false,
          status: 404,
          message: `Email ${email} já cadastrado.`,
        };
      }
    }

    const usuario = await UsuarioModel.findByIdAndUpdate(id, usuarioData);

    if (!usuario) {
      return {
        success: false,
        status: 404,
        message: `Usuário com id ${id} não existe.`,
      };
    }

    return { success: true, message: 'Usuário atualizado com sucesso.' };
  },

  updateSenha: async (id: string, senha: string) => {
    const hashedSenha = crypto.hashSync(senha, 10);

    const req = await RequisicaoMudancaSenhaModel.findById(id).select(
      'requisitante status',
    );

    if (!req) {
      return {
        success: false,
        status: 404,
        message: `Requisição com id ${id} não existe.`,
      };
    }

    if (req.status === 'aprovado') {
      await UsuarioModel.findByIdAndUpdate(req.requisitante, {
        senha: hashedSenha,
      });
    } else {
      return {
        success: false,
        status: 422,
        message: 'Código não verificado.',
      };
    }

    return { success: true, message: 'Senha atualizada com sucesso.' };
  },

  delete: async (id: string) => {
    const usuario = await UsuarioModel.findByIdAndDelete({ _id: id });

    if (!usuario) {
      return {
        success: false,
        status: 404,
        message: `Usuário com id ${id} não existe.`,
      };
    }

    if (usuario.fotoPublicId) {
      await cloudinary.uploader.destroy(usuario.fotoPublicId);
    }

    return { success: true, message: 'Usuário deletado com sucesso.' };
  },

  fotoGet: async (id: string) => {
    const usuario = await UsuarioModel.findById(id);

    if (!usuario) {
      return {
        success: false,
        status: 404,
        message: `Usuário com id ${id} não existe.`,
      };
    }

    if (!usuario.fotoPath) {
      return {
        success: false,
        status: 404,
        message: `Usuário com id ${id} não possui foto.`,
      };
    }

    return { success: true, data: usuario.fotoPath };
  },

  fotoCreate: async (id: string, img: SavedMultipartFile) => {
    const usuario = await UsuarioModel.findById(id);

    if (!usuario) {
      return {
        success: false,
        status: 404,
        message: `Usuário com id ${id} não existe.`,
      };
    }

    if (usuario.fotoPath) {
      return {
        success: false,
        status: 409,
        message: `Usuário com id ${id} já possui foto.`,
      };
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      img.filepath,
      {
        folder: `profilePictures/${id}`,
        transformation: {
          width: 250,
          height: 250,
          crop: 'thumb',
          gravity: 'face',
        },
      },
    );

    await usuario.updateOne({
      $set: { fotoPath: secure_url, fotoPublicId: public_id },
    });

    return { success: true, message: 'Imagem salva com sucesso.' };
  },

  fotoUpdate: async (id: string, img: SavedMultipartFile) => {
    const usuario = await UsuarioModel.findById(id);

    if (!usuario) {
      return {
        success: false,
        status: 404,
        message: `Usuário com id ${id} não existe.`,
      };
    }

    if (usuario.fotoPublicId) {
      await cloudinary.uploader.destroy(usuario.fotoPublicId);
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      img.filepath,
      {
        folder: `profilePictures/${id}`,
        transformation: {
          width: 250,
          height: 250,
          crop: 'thumb',
          gravity: 'face',
        },
      },
    );

    await usuario.updateOne({
      $set: { fotoPath: secure_url, fotoPublicId: public_id },
    });

    return { success: true, message: 'Imagem atualizada com sucesso.' };
  },

  fotoDelete: async (id: string) => {
    const usuario = await UsuarioModel.findById(id);

    if (!usuario) {
      return {
        success: false,
        status: 404,
        message: `Usuário com id ${id} não existe.`,
      };
    }

    if (!usuario.fotoPublicId) {
      return {
        success: false,
        status: 404,
        message: `Usuário com id ${id} não possui foto.`,
      };
    }

    await cloudinary.uploader.destroy(usuario.fotoPublicId);

    await usuario.updateOne({
      $unset: { fotoPath: '', fotoPublicId: '' },
    });

    return { success: true, message: 'Imagem deletada com sucesso.' };
  },
};
