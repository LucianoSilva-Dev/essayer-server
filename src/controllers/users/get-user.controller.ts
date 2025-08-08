import { UsuarioService } from '@/shared/services/UsuarioService';
import type { FastifyReply, FastifyRequest } from 'fastify';

// TODO: Usar Repository Pattern com Injeção de Dependência e Inversão de Dependência

export async function getUserController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as { id: string };

  const response = await UsuarioService.get(id);
  if (!response.success) {
    return reply
      .status(response.status as number)
      .send({ error: response.message });
  }

  return reply.status(200).send(response.data);
}
