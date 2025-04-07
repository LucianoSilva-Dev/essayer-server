// services to handle the business logic of the application
import type { FastifyReply } from 'fastify';
import { UserModel } from './Model';
import crypto from 'bcryptjs';
import type { userLoginBody, userRegisterBody } from './Types';

export const AuthService = {
  login: async (userCredentials: userLoginBody, reply: FastifyReply) => {
    const { email, password } = userCredentials;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return { auth: false, token: null };
    }

    if (!crypto.compareSync(password, user.password)) {
      return { auth: false, token: null };
    }

    const jwt = await reply.jwtSign({ id: user._id });
    return { auth: true, token: jwt };
  },

  register: async (User: userRegisterBody) => {
    const { name, email, password } = User;

    const user = await UserModel.findOne({ email });
    if (user) {
      return { success: false, statusCode: 409, error: 'Usuario já existe.' };
    }

    const hashedPassword = crypto.hashSync(password, 10);
    const newUser = new UserModel({ name, email, password: hashedPassword });
    await newUser.save();

    return { success: true, message: 'Usuario criado com sucesso.' };
  },
};
