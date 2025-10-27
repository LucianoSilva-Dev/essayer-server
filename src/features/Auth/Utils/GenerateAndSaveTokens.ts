import type { FastifyReply } from 'fastify';
import { Types } from 'mongoose';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS,
  REFRESH_TOKEN_EXPIRES_IN,
} from '../../../shared/Env';
import { redisClient } from '../../../shared/Redis/Provider';
import { SessionModel } from '../../../shared/Session/Model';
import { hashToken } from './HashToken';

export async function generateAndSaveTokens(
  reply: FastifyReply,
  userId: string | Types.ObjectId,
  userName: string,
  userCargo: string,
) {
  const fastify = reply.server;
  const userIdStr = userId.toString();
  const sessionId = new Types.ObjectId().toString();
  const accessToken = fastify.jwt.sign(
    { id: userIdStr, cargo: userCargo, nome: userName },
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
  );

  const refreshToken = fastify.jwt.sign(
    { userId: userIdStr, sessionId },
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN },
  );

  const refreshTokenExpiresAt = new Date(
    Date.now() + REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS * 1000,
  );
  const refreshTokenHash = await hashToken(refreshToken);

  await SessionModel.create({
    _id: sessionId,
    user: userId,
    refreshTokenHash,
    expiresAt: refreshTokenExpiresAt,
    isValid: true,
  });

  const redisKey = `session:${userIdStr}:${sessionId}`;
  await redisClient.set(
    redisKey,
    'valid',
    'EX',
    REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS,
  );

  return { accessToken, refreshToken, sessionId };
}
