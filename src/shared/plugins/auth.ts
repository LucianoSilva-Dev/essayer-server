import type { FastifyRequest, FastifyReply } from 'fastify';
import { fastifyPlugin } from 'fastify-plugin';
import type { RequestUserData } from '../Types';

export const authPlugin = fastifyPlugin(async (fastify) => {});

export const authUsuario = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Login necessário.' });
  }
};

export const authProfessor = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    await request.jwtVerify();

    const { cargo } = request.user as RequestUserData;

    if (cargo === 'aluno') {
      reply.status(401).send({ error: 'Necessário login como professor.' });
    }
  } catch (err) {
    reply.status(401).send({ error: 'Login necessário.' });
  }
};

export const authAdmin = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    await request.jwtVerify();

    const { cargo } = request.user as RequestUserData;

    if (cargo !== 'admin') {
      reply.status(401).send({ error: 'Necessário login como administrador.' });
    }
  } catch (err) {
    reply.status(401).send({ error: 'Login necessário.' });
  }
};
