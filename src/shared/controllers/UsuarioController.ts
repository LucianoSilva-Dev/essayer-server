import { UsuarioService } from '../services/UsuarioService';
import type { Controller, createUsuarioBody, professorCreateBody, updateUsuarioBody } from '../Types';

export const UsuarioController: Controller = {
  get: async (request, reply) => {
    const { id } = request.params as { id: string };

    const response = await UsuarioService.get(id);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ message: response.message });
    }

    return reply.status(200).send(response.data);
  },

  create: async (request, reply) => {
    const { nome, email, senha } = request.body as createUsuarioBody;

    const response = await UsuarioService.create({ nome, email, senha });

    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ message: response.message });
    }

    return reply.status(201).send({ message: response.message });
  },

  professorCreate: async (request, reply) => {
    const { lattes } = request.body as professorCreateBody;
    const { id } = request.user as {id: string};

    const response = await UsuarioService.professorCreate(id, lattes);
    return reply.status(201).send({ message: response.message });
  },

  update: async (request, reply) => {
    const { nome, email, senha } = request.body as updateUsuarioBody;
    const { id } = request.params as { id: string };

    const response = await UsuarioService.update(id, { nome, email, senha });

    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ message: response.message });
    }

    return reply.status(200).send({ message: response.message });
  },

  delete: async (request, reply) => {
    const { id } = request.params as { id: string };

    const response = await UsuarioService.delete(id);

    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ message: response.message });
    }

    return reply.status(200).send({ message: response.message });
  },

  fotoCreate: async (request, reply) => {},

  fotoUpdate: async (request, reply) => {},

  fotoDelete: async (request, reply) => {},
};
