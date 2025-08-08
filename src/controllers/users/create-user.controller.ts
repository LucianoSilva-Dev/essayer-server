import { UsuarioService } from '@/shared/services/UsuarioService';
import type { createUsuarioBody } from '@/shared/Types';
import type { FastifyReply, FastifyRequest } from 'fastify';

export async function createUserController(
  request: FastifyRequest<{ Body: createUsuarioBody }>,
  reply: FastifyReply,
) {
  const { nome, email, senha } = request.body;

  const response = await UsuarioService.create({
    nome,
    email: email.toLocaleLowerCase(),
    senha,
  });

  if (!response.success) {
    return reply
      .status(response.status as number)
      .send({ error: response.message });
  }

  return reply.status(201).send({ id: response.data });
}
