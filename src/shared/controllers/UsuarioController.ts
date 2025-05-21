import { UsuarioService } from '../services/UsuarioService';
import type {
  Controller,
  createUsuarioBody,
  professorCreateBody,
  RequestUserData,
  updateSenhaBody,
  updateUsuarioBody,
} from '../Types';

export const UsuarioController: Controller = {
  get: async (request, reply) => {
    const { id } = request.params as { id: string };

    const response = await UsuarioService.get(id);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send(response.data);
  },

  create: async (request, reply) => {
    const { nome, email, senha } = request.body as createUsuarioBody;

    const response = await UsuarioService.create({ nome, email, senha });

    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(201).send({ id: response.data });
  },

  professorCreate: async (request, reply) => {
    const { lattes } = request.body as professorCreateBody;
    const { id } = request.user as RequestUserData;

    const response = await UsuarioService.professorCreate(id, lattes);
    return reply.status(201).send({ message: response.message });
  },

  update: async (request, reply) => {
    const { nome, email } = request.body as updateUsuarioBody;
    const { id } = request.params as { id: string };
    const { id: requisitor } = request.user as RequestUserData;

    if (requisitor !== id) {
      return reply.status(403).send({
        error: 'Não é possível editar informações de outro usuário.',
      });
    }

    const response = await UsuarioService.update(id, { nome, email });

    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send({ message: response.message });
  },

  updateSenha: async (request, reply) => {
    const { senha } = request.body as updateSenhaBody;
    const { id } = request.params as { id: string };
    const { id: requisitor } = request.user as RequestUserData;

    if (requisitor !== id) {
      return reply.status(403).send({
        error: 'Não é possível editar informações de outro usuário.',
      });
    }

    const response = await UsuarioService.updateSenha(id, senha);

    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send({ message: response.message });
  },

  delete: async (request, reply) => {
    const { id } = request.params as { id: string };
    const { id: requisitante, cargo } = request.user as RequestUserData;

    if (requisitante !== id && cargo !== 'admin') {
      return reply.status(403).send({
        error: 'Não é possível editar a conta de outro usuário.',
      });
    }

    const response = await UsuarioService.delete(id);

    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send({ message: response.message });
  },

  fotoCreate: async (request, reply) => {
    const { id } = request.params as { id: string };
    const { id: requisitor } = request.user as RequestUserData;
    const files = await request.saveRequestFiles();

    if (requisitor !== id) {
      return reply.status(403).send({
        error: 'Não é possível editar informações de outro usuário.',
      });
    }

    const response = await UsuarioService.fotoCreate(id, files[0]);

    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send({ message: response.message });
  },

  fotoUpdate: async (request, reply) => {
    const { id } = request.params as { id: string };
    const { id: requisitor } = request.user as RequestUserData;
    const files = await request.saveRequestFiles();

    if (requisitor !== id) {
      return reply.status(403).send({
        error: 'Não é possível editar informações de outro usuário.',
      });
    }

    const response = await UsuarioService.fotoUpdate(id, files[0]);

    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send({ message: response.message });
  },

  fotoDelete: async (request, reply) => {
    const { id } = request.params as { id: string };
    const { id: requisitor } = request.user as RequestUserData;

    if (requisitor !== id) {
      return reply.status(403).send({
        error: 'Não é possível editar informações de outro usuário.',
      });
    }

    const response = await UsuarioService.fotoDelete(id);

    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ message: response.message });
    }

    return reply.status(200).send({ message: response.message });
  },
};
