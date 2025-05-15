import type { FastifyReply, FastifyRequest } from 'fastify';
import type { RequestUserData } from '../Types';

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
