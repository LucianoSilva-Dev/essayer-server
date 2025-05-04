import { UserModel } from '../../features/Auth/Model';
import { UsuarioModel } from '../models/UsuarioModel';
import crypto from 'bcryptjs';
import type { createUsuarioBody, updateUsuarioBody } from '../Types';
import { RequisicaoProfessorModel } from '../models/RequisicaoProfessorModel';

export const UsuarioService = {
  get: async (id: string) => {
    const usuario = await UsuarioModel.findById(id).select('nome email senha foto cargo');

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

    const usuario = await UserModel.findOne({ email });
    if (usuario) {
      return {
        success: false,
        status: 409,
        message: 'Usuário já existe.',
      };
    }

    const hashedSenha = crypto.hashSync(senha, 10);
    await UsuarioModel.create({
      nome,
      email,
      senha: hashedSenha,
      cargo: 'aluno',
    });

    return {
      success: true,
      message: 'Usuário criado com sucesso.',
    };
  },

  professorCreate: async (id: string, lattes: string) => {
    await RequisicaoProfessorModel.create({
      lattes: lattes,
      requisitante: id
    });

    return {success: true, message: "Requisição criada com sucesso."}
  },

  update: async (id: string, usuarioData: updateUsuarioBody) => {
    const { nome, email, senha } = usuarioData;

    let newData: updateUsuarioBody = usuarioData;

    if (senha) {
      const hashedSenha = crypto.hashSync(senha, 10);
      newData = {
        nome,
        email,
        senha: hashedSenha,
      };
    }

    const usuario = await UsuarioModel.findByIdAndUpdate(id, newData);

    if (!usuario) {
      return {
        success: false,
        status: 404,
        message: `Usuário com id ${id} não existe.`,
      };
    }

    return { success: true, message: 'Usuário atualizado com sucesso.' };
  },

  delete: async (id: string) => {
    const usuario = await UsuarioModel.findOneAndDelete({ _id: id });

    if (!usuario) {
      return {
        success: false,
        status: 404,
        message: `Usuário com id ${id} não existe.`,
      };
    }

    return { success: true, message: 'Usuário deletado com sucesso.' };
  },

  fotoCreate: async () => {},

  fotoUpdate: async () => {},

  fotoDelete: async () => {},
};
