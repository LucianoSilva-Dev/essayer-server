import type { FastifyReply, FastifyRequest } from 'fastify';
import type { SSEGenericError } from '../Types';

export const authMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Login necessário.' });
  }
};

export const optionalAuthMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) return;

    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Token JWT inválido.' });
  }
};

export const sseAuthMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    const sseGenericError: SSEGenericError = {
      event: 'error',
      data: {
        statusCode: 401,
        message: 'Token JWT inválido.',
      },
    };
    reply.sse({
      event: sseGenericError.event,
      data: JSON.stringify(sseGenericError.data),
    });

    reply.sseContext.source.end() // Fecha a conexão sse
    return reply // Encerra o fluxo da request, impedindo avança ao controller
  }
};
