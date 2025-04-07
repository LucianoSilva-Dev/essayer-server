import { fastifyPlugin } from 'fastify-plugin';
import jwtPlugin from '@fastify/jwt';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { JWT_SECRET } from '../../shared/Env';

export const authPlugin = fastifyPlugin(async (fastify) => {
  fastify.register(jwtPlugin, {
    secret: JWT_SECRET as string,
  });
});

export const authMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
};
