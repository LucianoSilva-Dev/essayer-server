// TODO: Porque isso é de /users?
/* 
Essa parte não faz muito sentido devido à nomenclatura do domínio
*/

import { UsuarioService } from '@/shared/services/UsuarioService';
import type { professorCreateBody, RequestUserData } from '@/shared/Types';
import type { FastifyReply, FastifyRequest } from 'fastify';

export async function professorCreateController(
  request: FastifyRequest<{ Body: professorCreateBody }>,
  reply: FastifyReply,
) {
  const { lattes } = request.body;
  const { id } = request.user as RequestUserData;

  const response = await UsuarioService.professorCreate(id, lattes);
  return reply.status(201).send({ message: response.message });
}
