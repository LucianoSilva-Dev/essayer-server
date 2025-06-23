import { RequisicaoMudancaSenhaService } from '../services/RequisicaoMudancaSenhaService';
import type { Controller, createRequisicaoMudancaSenhaBody, RequestUserData, validateRequisicaoMudancaSenhaBody } from '../Types';

export const RequisicaoMudancaSenhaController: Controller = {
  create: async (request, reply) => {
    const { email } = request.body as createRequisicaoMudancaSenhaBody;

    const response = await RequisicaoMudancaSenhaService.create(email);

    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(201).send({ id: response.data });
  },
  validate: async (request, reply) => {
    const { id } = request.params as { id: string };
    const { codigo } = request.body as validateRequisicaoMudancaSenhaBody;

    const response = await RequisicaoMudancaSenhaService.validate(id, codigo);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send({ message: response.message });
  },
  get: async (request, reply) => {
    const { id } = request.params as { id: string };

    const response = await RequisicaoMudancaSenhaService.get(id);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send(response.data);
  },
};
