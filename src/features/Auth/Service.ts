// services to handle the business logic of the application
import type { FastifyReply } from 'fastify';
import crypto from 'bcryptjs';
import type { userLoginBody } from './Types';
import { UsuarioModel } from '../../shared/Usuario/Model';

export const AuthService = {
  login: async (userCredentials: userLoginBody, reply: FastifyReply) => {
    const { email, senha } = userCredentials;
    const user = await UsuarioModel.findOne({ email: email.toLocaleLowerCase() });
    if (!user) {
      return { auth: false, token: null };
    }

    if (!crypto.compareSync(senha, user.senha)) {
      return { auth: false, token: null };
    }

    const jwt = await reply.jwtSign({ id: user._id, cargo: user.cargo, nome: user.nome });
    return { auth: true, token: jwt };
  }
};
