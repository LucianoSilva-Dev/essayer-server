import type { Controller } from '../../../shared/Types';
import { ObraService } from '../Services/ObraService';
import type { CreateObraBody, UpdateObraBody } from '../Types';

export const ObraController: Controller = {
  obraGet: async (request, reply) => {
    const { id: obraId } = request.params as { id: string };

    const response = await ObraService.get(obraId);
    if (!response.success) {
      return reply.status(response.status).send({ message: response.message });
    }

    reply.send(response.data);
  },
  obraCreate: async (request, reply) => {
    const { titulo, sinopse, autor, tipoObra, subtopicos } =
      request.body as CreateObraBody;
    const { id: userId } = request.user as { id: string };

    const response = await ObraService.create(
      { titulo, sinopse, autor, tipoObra, subtopicos },
      userId,
    );

    if (!response.success) {
      return reply.status(response.status).send({ message: response.message });
    }

    reply.status(201).send({ message: response.data });
  },
  obraUpdate: async (request, reply) => {
    const { autor, sinopse, subtopicos, tipo, titulo } =
      request.body as UpdateObraBody;
    const { id: obraId } = request.params as { id: string };

    const response = await ObraService.update(
      { titulo, sinopse, autor, tipo, subtopicos },
      obraId,
    );

    if (!response.success) {
      return reply.status(response.status).send({ message: response.message });
    }

    reply.send({ message: response.data });
  },
};
