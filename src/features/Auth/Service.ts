// services to handle the business logic of the application
import type { FastifyReply } from 'fastify';
import { AuthModel } from './Model';
import crypto from 'bcryptjs';
import type { getTokenAuthBody, registerAuthBody } from './Types';


export const AuthService = {
  getToken: async (userCredentials: getTokenAuthBody, reply: FastifyReply) => {
    const { email, password } = userCredentials;
    const user = await AuthModel.findOne({ email});
    if (!user) {
      return { auth: false, token: null };
    }

    if (!crypto.compareSync(password, user.password)) {
      return { auth: false, token: null };
    }

    const jwt = await reply.jwtSign({ id: user._id });
    return { auth: true, token: jwt };
  },

  register: async (User: registerAuthBody) => {
    const { name, email, password } = User;

    const user = await AuthModel.findOne({ email });
    if (user) {
      return { success: false, statusCode: 404, error: 'User already exists' };
    }

    const hashedPassword = crypto.hashSync(password, 10);
    const newUser = new AuthModel({ name, email, password: hashedPassword });
    await newUser.save();

    return { success: true, message: 'User created successfully' };
  },
};
