// src/features/Auth/Service.ts

import crypto from 'bcryptjs';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Types } from 'mongoose';
import { redisClient } from '../../shared/Redis/Provider';
import { SessionModel } from '../../shared/Session/Model';
import { UsuarioModel } from '../../shared/Usuario/Model';
import type { UserLoginResponse, userLoginBody } from './Types';
import { clearReplyCookies } from './Utils/ClearReplyCookies';
import { compareToken } from './Utils/CompareToken';
import { generateAndSaveTokens } from './Utils/GenerateAndSaveTokens';

async function invalidateAllUserSessions(userId: string | Types.ObjectId) {
  const userIdStr = userId.toString();
  console.warn(`Invalidating all sessions for user ${userIdStr}`);

  await SessionModel.updateMany(
    { user: userId, isValid: true },
    { $set: { isValid: false } },
  );

  const keys = await redisClient.keys(`session:${userIdStr}:*`);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
}

interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
}

export const AuthService = {
  login: async (userCredentials: userLoginBody, reply: FastifyReply) => {
    const { email, senha } = userCredentials;
    const user = await UsuarioModel.findOne({
      email: email.toLocaleLowerCase(),
    }).lean();
    if (!user) {
      console.log(`Login attempt failed: User not found for email ${email}`);
      return { auth: false, accessToken: null, refreshToken: null };
    }

    const isPasswordValid = crypto.compareSync(senha, user.senha);
    if (!isPasswordValid) {
      console.log(`Login attempt failed: Invalid password for user ${email}`);
      return { auth: false, accessToken: null, refreshToken: null };
    }

    try {
      const { accessToken, refreshToken } = await generateAndSaveTokens(
        reply,
        user._id,
        user.nome,
        user.cargo,
      );

      const response: UserLoginResponse = {
        id: user._id.toString(),
        ...user,
      };
      return { auth: true, accessToken, refreshToken, userData: response };
    } catch (error) {
      console.error(`Error generating tokens for user ${email}:`, error);
      return {
        auth: false,
        accessToken: null,
        refreshToken: null,
        error: 'Token generation failed',
      };
    }
  },

  refresh: async (request: FastifyRequest, reply: FastifyReply) => {
    const fastify = request.server;
    const oldRefreshToken = request.cookies.refreshToken;

    if (!oldRefreshToken) {
      clearReplyCookies(reply);
      return {
        success: false,
        status: 401,
        message: 'Refresh token não fornecido.',
      } as const;
    }

    let payload: RefreshTokenPayload;
    try {
      payload = fastify.jwt.verify<RefreshTokenPayload>(oldRefreshToken);
    } catch (err) {
      console.warn(
        'Refresh token inválido ou expirado (JWT verification failed):',
        err,
      );
      clearReplyCookies(reply);
      return {
        success: false,
        status: 401,
        message: 'Refresh token inválido ou expirado.',
      } as const;
    }

    const { userId, sessionId } = payload;
    const redisKey = `session:${userId}:${sessionId}`;

    try {
      const redisStatus = await redisClient.get(redisKey);
      if (redisStatus !== 'valid') {
        console.warn(
          `Refresh token reuse detected or session expired in Redis for user ${userId}, session ${sessionId}. Invalidating all sessions.`,
        );
        await invalidateAllUserSessions(userId);
        clearReplyCookies(reply);
        return {
          success: false,
          status: 401,
          message: 'Sessão inválida ou expirada. Faça login novamente.',
        } as const;
      }

      const session = await SessionModel.findOne({
        _id: sessionId,
        user: userId,
        isValid: true,
        expiresAt: { $gt: new Date() },
      });

      if (!session) {
        console.warn(
          `Session not found or invalid in DB for user ${userId}, session ${sessionId}. Invalidating all sessions.`,
        );
        await invalidateAllUserSessions(userId);
        clearReplyCookies(reply);
        return {
          success: false,
          status: 401,
          message: 'Sessão inválida. Faça login novamente.',
        } as const;
      }

      const isTokenMatch = await compareToken(
        oldRefreshToken,
        session.refreshTokenHash,
      );
      if (!isTokenMatch) {
        console.warn(
          `Refresh token hash mismatch for user ${userId}, session ${sessionId}. Invalidating all sessions.`,
        );
        await invalidateAllUserSessions(userId);
        clearReplyCookies(reply);
        return {
          success: false,
          status: 401,
          message: 'Token inválido. Faça login novamente.',
        } as const;
      }

      const deletedFromRedis = await redisClient.del(redisKey);
      session.isValid = false;
      await session.save();

      if (deletedFromRedis === 0) {
        console.warn(
          `Failed to delete session from Redis during refresh for user ${userId}, session ${sessionId}. Invalidating all sessions.`,
        );
        await invalidateAllUserSessions(userId);
        clearReplyCookies(reply);
        return {
          success: false,
          status: 401,
          message: 'Erro ao rotacionar token. Faça login novamente.',
        } as const;
      }

      const user = await UsuarioModel.findById(userId)
        .select('nome cargo')
        .lean();
      if (!user) {
        console.error(`User ${userId} not found during token refresh.`);
        await invalidateAllUserSessions(userId);
        clearReplyCookies(reply);
        return {
          success: false,
          status: 404,
          message: 'Usuário não encontrado.',
        } as const;
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await generateAndSaveTokens(reply, userId, user.nome, user.cargo);

      console.log(`Token refreshed successfully for user ${userId}`);
      return {
        success: true,
        data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      } as const;
    } catch (error) {
      console.error(`Error during token refresh for user ${userId}:`, error);
      try {
        await invalidateAllUserSessions(userId);
      } catch (invalidationError) {
        console.error(
          `Error invalidating sessions after refresh error for user ${userId}:`,
          invalidationError,
        );
      }
      clearReplyCookies(reply);
      return {
        success: false,
        status: 500,
        message: 'Internal Server Error',
      } as const;
    }
  },

  logout: async (request: FastifyRequest, reply: FastifyReply) => {
    const fastify = request.server;
    const refreshToken = request.cookies.refreshToken;

    clearReplyCookies(reply);

    if (!refreshToken) {
      console.log('Logout with no refreshToken');
      return {
        success: true,
        message: 'Logout realizado (sem token).',
      } as const;
    }

    try {
      const payload = fastify.jwt.verify<RefreshTokenPayload>(refreshToken);
      const { userId, sessionId } = payload;
      const redisKey = `session:${userId}:${sessionId}`;

      await SessionModel.updateOne(
        { _id: sessionId, user: userId },
        { $set: { isValid: false } },
      );
      await redisClient.del(redisKey);

      console.log(`Logout successful for user ${userId}, session ${sessionId}`);
      return {
        success: true,
        message: 'Logout realizado com sucesso.',
      } as const;
    } catch (err) {
      console.warn('Logout attempt with invalid refresh token:', err);
      return {
        success: true,
        message: 'Logout realizado (token inválido).',
      } as const;
    }
  },

  getUserInfo: async (id: string) => {
    const user = await UsuarioModel.findById(id).lean();

    if (!user)
      return {
        success: false,
        status: 401,
        message: 'Sessão expirada. Por favor, faça login novamente.',
      } as const;

    return {
      success: true,
      data: { id: user._id.toString(), ...user },
    } as const;
  },
};
