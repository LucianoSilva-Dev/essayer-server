import type { Controller, RequestUserData } from '../../../shared/Types';
import { CitacaoService } from '../Services/CitacaoService';
import type { CreateCitacaoBody, UpdateCitacaoBody } from '../Types';

export const CitacaoController: Controller = {
  citacaoGet: async (request, reply) => {
    const { id } = request.params as { id: string };

    const response = await CitacaoService.get(id);
    if (!response.success) {
      return reply.status(response.status).send({ message: response.message });
    }

    reply.send(response.data);
  },
  citacaoCreate: async (request, reply) => {
    const { fonte, autor, frase, subtopicos } =
      request.body as CreateCitacaoBody;
    const { id: userId } = request.user as RequestUserData;

    const response = await CitacaoService.create(
      { fonte, autor, frase, subtopicos },
      userId,
    );

    if (!response.success) {
      return reply.status(response.status).send({ message: response.message });
    }

    reply.status(201).send({ message: response.data });
  },
  citacaoUpdate: async (request, reply) => {
    const { fonte, autor, frase, subtopicos } =
      request.body as UpdateCitacaoBody;
    const { id: citacaoId } = request.params as { id: string };

    const response = await CitacaoService.update(
      { fonte, autor, frase, subtopicos },
      citacaoId,
    );
  },
};
