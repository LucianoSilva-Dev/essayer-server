import type { FastifyReply, FastifyRequest } from 'fastify';
import type { SSEGenericError } from '../Types';
import { verifyTokenFromCookie } from './Utils/VerifyTokenFormCookie';

export const authMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  await verifyTokenFromCookie(request, reply);
};

export const optionalAuthMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const token = request.cookies.accessToken;
  if (!token) return;
  try {
    await request.jwtVerify();
  } catch (err) {
    console.error('Optional Auth JWT Verification Error:', err);
    reply
      .status(401)
      .send({ error: 'Token de acesso inválido ou expirado (opcional).' });
  }
};

export const sseAuthMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const token = request.cookies.accessToken;

  if (!token) {
    const sseError: SSEGenericError = {
      event: 'error',
      data: {
        statusCode: 401,
        message: 'Login necessário.',
      },
    };
    reply.sse({ event: sseError.event, data: JSON.stringify(sseError.data) });
    reply.sseContext?.source?.end();
    return;
  }

  try {
    await request.jwtVerify();
  } catch (err) {
    console.error('SSE Auth JWT Verification Error:', err);
    const sseGenericError: SSEGenericError = {
      event: 'error',
      data: {
        statusCode: 401,
        message: 'Login necessário',
      },
    };
    reply.sse({
      event: sseGenericError.event,
      data: JSON.stringify(sseGenericError.data),
    });
    reply.sseContext?.source?.end();
    return;
  }
};
