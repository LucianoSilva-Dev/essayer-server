import { formatObraDoc } from '../../features/Repertorios/Helpers/FormatObraDoc';
import { UsuarioService } from '../services/UsuarioService';
import type {
  Controller,
  createUsuarioBody,
  professorCreateBody,
  RequestUserData,
  updateSenhaBody,
  updateUsuarioBody,
} from '../Types';
import path from 'node:path';

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

    const response = await UsuarioService.create({ nome, email: email.toLocaleLowerCase(), senha });

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

    const response = await UsuarioService.update(id, { nome, email: email?.toLocaleLowerCase() });

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

  fotoGet: async (request, reply) => {
    const { id } = request.params as { id: string };
    const response = await UsuarioService.fotoGet(id);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    const fotoUrl = response.data as string;
    return reply.status(200).send({ fotoUrl });
  },

  fotoCreate: async (request, reply) => {
    const { id } = request.params as { id: string };
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
  },

  fotoUpdate: async (request, reply) => {
    const { id } = request.params as { id: string };
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

    const response = await UsuarioService.fotoUpdate(id, file);

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
