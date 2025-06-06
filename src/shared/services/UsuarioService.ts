import { UsuarioModel } from '../models/UsuarioModel';
import crypto from 'bcryptjs';
import type { createUsuarioBody, updateUsuarioBody } from '../Types';
import { RequisicaoProfessorModel } from '../models/RequisicaoProfessorModel';
import type { SavedMultipartFile } from '@fastify/multipart';
import { Transporter } from '../Transporter';

import fs from 'fs-extra';
import { EMAIL } from '../Env';
import { RequisicaoUsuarioModel } from '../models/RequisicaoUsuarioModel';
import { randomBytes } from 'node:crypto';
import { RequisicaoMudancaSenhaModel } from '../models/RequisicaoMudancaSenhaModel';

export const UsuarioService = {
  get: async (id: string) => {
    const usuario = await UsuarioModel.findById(id).select(
      'nome email senha foto cargo',
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
    if (usuario) {
      return {
        success: false,
        status: 409,
        message: 'Usuário já existe.',
      };
    }

    const hashedSenha = crypto.hashSync(senha, 10);
    const code = randomBytes(6).toString('base64');

    const req = await RequisicaoUsuarioModel.create({
      nome,
      email,
      senha: hashedSenha,
      codigo: code,
    });

    Transporter.sendMail({
      from: `Incita <${EMAIL}>`,
      to: email,
      subject: 'Cadastro Incita',
      template: 'codigo',
      context: {
        codigo: code,
      },
    });

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

    Transporter.sendMail({
      from: `Incita <${EMAIL}>`,
      to: usuario.email,
      subject: 'Requisição Recebida!',
      template: 'notificacao',
    });

    return { success: true, message: 'Requisição criada com sucesso.' };
  },

  update: async (id: string, usuarioData: updateUsuarioBody) => {
    const { email } = usuarioData;

    if (email) {
      const userEmail = await UsuarioModel.findOne({ email: email });
      if (userEmail) {
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

    const destiny = `${process.cwd()}/profilePictures/${id}/`;
    fs.removeSync(destiny);

    return { success: true, message: 'Usuário deletado com sucesso.' };
  },

  fotoCreate: async (id: string, img: SavedMultipartFile) => {
    const destiny = `${process.cwd()}\\profilePictures\\${id}\\`;

    const usuario = await UsuarioModel.findByIdAndUpdate(id, {
      $set: { foto: destiny + img.filename },
    });

    if (!usuario) {
      return {
        success: false,
        status: 404,
        message: `Usuário com id ${id} não existe.`,
      };
    }

    if (fs.pathExistsSync(destiny)) {
      return {
        success: false,
        status: 409,
        message: `Usuário com id ${id} já possui foto.`,
      };
    }

    fs.moveSync(img.filepath, destiny + img.filename);

    return { success: true, message: 'Imagem salva com sucesso.' };
  },

  fotoUpdate: async (id: string, img: SavedMultipartFile) => {
    const destiny = `${process.cwd()}\\profilePictures\\${id}\\`;

    if (!fs.pathExistsSync(destiny)) {
      return {
        success: false,
        status: 404,
        message: `Usuário com id ${id} não possui foto.`,
      };
    }

    const usuario = await UsuarioModel.findByIdAndUpdate(id, {
      foto: destiny + img.filename,
    });

    if (!usuario) {
      return {
        success: false,
        status: 404,
        message: `Usuário com id ${id} não existe.`,
      };
    }

    fs.removeSync(destiny);
    fs.moveSync(img.filepath, destiny + img.filename);

    return { success: true, message: 'Imagem atualizada com sucesso.' };
  },

  fotoDelete: async (id: string) => {
    const destiny = `${process.cwd()}\\profilePictures\\${id}\\`;

    if (!fs.pathExistsSync(destiny)) {
      return {
        success: false,
        status: 404,
        message: `Usuário com id ${id} não possui foto.`,
      };
    }

    const usuario = await UsuarioModel.findByIdAndUpdate(id, {
      foto: undefined,
    });

    if (!usuario) {
      return {
        success: false,
        status: 404,
        message: `Usuário com id ${id} não existe.`,
      };
    }

    fs.removeSync(destiny);

    return { success: true, message: 'Imagem deletada com sucesso.' };
  },
};
