import type { Controller } from "../../shared/Types";

export const RepertorioController: Controller = {
  // --- Repertórios em geral ---
  get_all: async (request, reply) => {
    reply.send({ message: 'get_all repertorios' });
  },
  delete: async (request, reply) => {
    reply.send({ message: 'delete repertorio' });
  },
  comentarioCreate: async (request, reply) => {
    reply.send({ message: 'create comentario' });
  },

  // --- Citações ---
  citacaoGet: async (request, reply) => {
    reply.send({ message: 'get citacao' });
  },
  citacaoCreate: async (request, reply) => {
    reply.send({ message: 'create citacao' });
  },
  citacaoUpdate: async (request, reply) => {
    reply.send({ message: 'update citacao' });
  },

  // --- Artigos ---
  artigoGet: async (request, reply) => {
    reply.send({ message: 'get artigo' });
  },
  artigoCreate: async (request, reply) => {
    reply.send({ message: 'create artigo' });
  },
  artigoUpdate: async (request, reply) => {
    reply.send({ message: 'update artigo' });
  },

  // --- Obras ---
  obraGet: async (request, reply) => {
    reply.send({ message: 'get obra' });
  },
  obraCreate: async (request, reply) => {
    reply.send({ message: 'create obra' });
  },
  obraUpdate: async (request, reply) => {
    reply.send({ message: 'update obra' });
  },
};
