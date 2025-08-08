import { UsuarioService } from '@/shared/services/UsuarioService';
import type { RequestUserData, updateUsuarioBody } from '@/shared/Types';
import type { FastifyReply, FastifyRequest } from 'fastify';

export async function updateUserController(
  request: FastifyRequest<{ Body: updateUsuarioBody; Params: { id: string } }>,
  reply: FastifyReply,
) {
  const { nome, email } = request.body as updateUsuarioBody;
  const { id } = request.params as { id: string };
  const { id: requisitor } = request.user as RequestUserData;

  if (requisitor !== id) {
    return reply.status(403).send({
      error: 'Não é possível editar informações de outro usuário.',
    });
  }

  const response = await UsuarioService.update(id, {
    nome,
    email: email?.toLocaleLowerCase(),
  });

  if (!response.success) {
    return reply
      .status(response.status as number)
      .send({ error: response.message });
  }

  return reply.status(200).send({ message: response.message });
}
