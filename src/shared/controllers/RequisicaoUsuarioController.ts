import { RequisicaoUsuarioService } from '../services/RequisicaoUsuarioService';
import type { Controller, validateRequisicaoUsuarioBody } from '../Types';

export const RequisicaoUsuarioController: Controller = {
  validate: async (request, reply) => {
    const { id } = request.params as { id: string };
    const { codigo } = request.body as validateRequisicaoUsuarioBody;

    const response = await RequisicaoUsuarioService.validate(id, codigo);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send({ message: response.message });
  },
  get: async (request, reply) => {
    const {id} = request.params as {id: string}

    const response = await RequisicaoUsuarioService.get(id)
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send(response.data);
  },
};
