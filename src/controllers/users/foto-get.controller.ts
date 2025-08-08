import { UsuarioService } from '@/shared/services/UsuarioService';
import type { FastifyReply, FastifyRequest } from 'fastify';

export async function fotoGetController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as { id: string };
  const response = await UsuarioService.fotoGet(id);
  if (!response.success) {
    return reply
      .status(response.status as number)
      .send({ error: response.message });
  }

  const fotoUrl = response.data as string;
  return reply.status(200).send({ fotoUrl });
}
