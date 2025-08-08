import type { FastifyReply, FastifyRequest } from 'fastify';

export type ControllerMethod = (
  request: FastifyRequest,
  reply: FastifyReply,
) => Promise<void>;
