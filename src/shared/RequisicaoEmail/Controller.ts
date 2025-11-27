import { RequisicaoEmailService } from './Service';
import type { Controller, RequestUserData } from '../Types';
import { CreateRequisicaoEmailBody, ValidateRequisicaoEmailBody } from './Types';

export const RequisicaoEmailController: Controller = {
  create: async (request, reply) => {
    const { email } = request.body as CreateRequisicaoEmailBody;

    const response = await RequisicaoEmailService.create(email);

    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(201).send({ id: response.data });
  },
  validate: async (request, reply) => {
    const { id } = request.params as { id: string };
    const { codigo } = request.body as ValidateRequisicaoEmailBody;

    const response = await RequisicaoEmailService.validate(id, codigo);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send({ message: response.message });
  },
};
