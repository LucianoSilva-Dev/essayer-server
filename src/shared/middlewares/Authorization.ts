import type { FastifyReply, FastifyRequest } from 'fastify';
import type { RequestUserData } from '../Types';
import { UsuarioModel } from '../Usuario/Model';
import { verifyTokenFromCookie } from './Utils/VerifyTokenFormCookie';

export const authProfessor = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    await verifyTokenFromCookie(request, reply);

    const { cargo } = request.user as RequestUserData;

    if (cargo === 'aluno') {
      reply.status(403).send({ error: 'Necessário login como professor.' });
    }
  } catch (err) {
    reply.status(401).send({ error: 'Login necessário.' });
  }
};

export const authProfessorCreate = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    await verifyTokenFromCookie(request, reply);

    const { cargo, id } = request.user as RequestUserData;

    if (cargo === 'aluno') {
      reply.status(403).send({ error: 'Necessário login como professor.' });
    }

    const user = await UsuarioModel.findById(id);

    if (!user) {
      reply.status(404).send({ error: 'usuário não existe.' });
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
    await verifyTokenFromCookie(request, reply);

    const { cargo } = request.user as RequestUserData;

    if (cargo !== 'admin') {
      reply.status(403).send({ error: 'Necessário login como administrador.' });
    }
  } catch (err) {
    reply.status(401).send({ error: 'Login necessário.' });
  }
};
