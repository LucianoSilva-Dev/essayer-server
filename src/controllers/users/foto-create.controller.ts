import { UsuarioService } from '@/shared/services/UsuarioService';
import type { RequestUserData } from '@/shared/Types';
import type { FastifyReply, FastifyRequest } from 'fastify';

export async function fotoCreateController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const { id: requisitor } = request.user as RequestUserData;
  const files = await request.saveRequestFiles();
  const file = files[0];

  if (!file) {
    return reply.status(400).send({ errors: ['Nenhum arquivo foi enviado.'] });
  }

  const allowedMimetypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimetypes.includes(file.mimetype)) {
    return reply.status(415).send({
      error: 'Tipo de arquivo não suportado. Use JPG, PNG ou WEBP.',
    });
  }

  if (requisitor !== id) {
    return reply.status(403).send({
      error: 'Não é possível editar informações de outro usuário.',
    });
  }

  const response = await UsuarioService.fotoCreate(id, file);

  if (!response.success) {
    return reply
      .status(response.status as number)
      .send({ error: response.message });
  }

  return reply.status(200).send({ message: response.message });
}
