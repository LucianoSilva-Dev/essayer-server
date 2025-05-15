import type { FastifyReply, FastifyRequest } from "fastify";

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
    const authHeader = request.headers.authorization
    if(!authHeader) return
    
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Token JWT inválido.' });
  }
};