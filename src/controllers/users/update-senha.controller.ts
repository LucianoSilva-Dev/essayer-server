import { UsuarioService } from '@/shared/services/UsuarioService';
import type { updateSenhaBody } from '@/shared/Types';
import type { FastifyReply, FastifyRequest } from 'fastify';

export async function updateSenhaController(
  request: FastifyRequest<{ Body: updateSenhaBody; Params: { id: string } }>,
  reply: FastifyReply,
) {
  const { senha } = request.body as updateSenhaBody;
  const { id } = request.params as { id: string };

  const response = await UsuarioService.updateSenha(id, senha);

  if (!response.success) {
    return reply
      .status(response.status as number)
      .send({ error: response.message });
  }

  return reply.status(200).send({ message: response.message });
}
