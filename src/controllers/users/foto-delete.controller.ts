import { UsuarioService } from '@/shared/services/UsuarioService';
import type { RequestUserData } from '@/shared/Types';
import type { FastifyReply, FastifyRequest } from 'fastify';

export async function fotoDeleteController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const { id: requisitor } = request.user as RequestUserData;

  if (requisitor !== id) {
    return reply.status(403).send({
      error: 'Não é possível editar informações de outro usuário.',
    });
  }

  const response = await UsuarioService.fotoDelete(id);

  if (!response.success) {
    return reply
      .status(response.status as number)
      .send({ message: response.message });
  }

  return reply.status(200).send({ message: response.message });
}
