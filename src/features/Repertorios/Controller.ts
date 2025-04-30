import type { Controller } from "../../shared/Types";

export const RepertorioController: Controller = {
  // ...existing code if any...
  get_all: async (request, reply) => {
    // placeholder
    reply.send({ message: 'get_all repertorios' });
  },
  delete: async (request, reply) => {
    // placeholder
    reply.send({ message: 'delete repertorio' });
  },
  citacaoCreate: async (request, reply) => {
    // placeholder
    reply.send({ message: 'create citacao' });
  },
  citacaoUpdate: async (request, reply) => {
    // placeholder
    reply.send({ message: 'update citacao' });
  },
  artigoCreate: async (request, reply) => {
    // placeholder
    reply.send({ message: 'create artigo' });
  },
  artigoUpdate: async (request, reply) => {
    // placeholder
    reply.send({ message: 'update artigo' });
  },
  obraCreate: async (request, reply) => {
    // placeholder
    reply.send({ message: 'create obra' });
  },
  obraUpdate: async (request, reply) => {
    // placeholder
    reply.send({ message: 'update obra' });
  },
  // ...existing code if any...
};
