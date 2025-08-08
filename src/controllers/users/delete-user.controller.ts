import { UsuarioService } from '@/shared/services/UsuarioService';
import type { RequestUserData } from '@/shared/Types';
import type { FastifyReply, FastifyRequest } from 'fastify';

export async function deleteUserController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const { id } = request.params as { id: string };
  const { id: requisitante, cargo } = request.user as RequestUserData;

  if (requisitante !== id && cargo !== 'admin') {
    return reply.status(403).send({
      error: 'Não é possível editar a conta de outro usuário.',
    });
  }

  const response = await UsuarioService.delete(id);

  if (!response.success) {
    return reply
      .status(response.status as number)
      .send({ error: response.message });
  }

  return reply.status(200).send({ message: response.message });
}
