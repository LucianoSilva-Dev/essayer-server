import type { FastifyReply, FastifyRequest } from 'fastify';
import { REFRESH_TOKEN_COOKIE_PATH } from '../../shared/Constants/auth';
import {
  ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS,
  REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS,
} from '../../shared/Env';
import type { Controller, RequestUserData } from '../../shared/Types';
import { AuthService } from './Service';
import type { userLoginBody } from './Types';
import { commonCookieOptions } from './Utils/CommonCookieOptions';

export const AuthController: Controller = {
  login: async (request, reply) => {
    const response = await AuthService.login(
      request.body as userLoginBody,
      reply,
    );

    if ('error' in response && response.error) {
      return reply.status(500).send({ error: response.error });
    }

    if (!response.auth || !response.accessToken || !response.refreshToken) {
      return reply.status(401).send({ error: 'Credenciais inválidas.' });
    }

    reply
      .setCookie(
        'accessToken',
        response.accessToken,
        commonCookieOptions(ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS),
      )
      .setCookie(
        'refreshToken',
        response.refreshToken,
        commonCookieOptions(
          REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS,
          REFRESH_TOKEN_COOKIE_PATH,
        ),
      )
      .status(200)
      .send(response.userData);
  },

  refresh: async (request: FastifyRequest, reply: FastifyReply) => {
    const response = await AuthService.refresh(request, reply);

    if (!response.success || !response.data) {
      return reply
        .status(response.status || 401)
        .send({ error: response.message });
    }

    reply
      .setCookie(
        'accessToken',
        response.data.accessToken,
        commonCookieOptions(ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS),
      )
      .setCookie(
        'refreshToken',
        response.data.refreshToken,
        commonCookieOptions(
          REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS,
          REFRESH_TOKEN_COOKIE_PATH,
        ),
      )
      .status(200)
      .send({ message: 'Token atualizado com sucesso' });
  },

  logout: async (request: FastifyRequest, reply: FastifyReply) => {
    const response = await AuthService.logout(request, reply);

    if (!response.success) {
      return reply.status(500).send({ error: response.message });
    }

    return reply.status(204).send();
  },

  getUserInfo: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.user as RequestUserData;
    const response = await AuthService.getUserInfo(id);

    if (!response.success)
      return reply.status(response.status).send({ message: response.message });
    
    reply.status(200).send(response.data)
  },
};
