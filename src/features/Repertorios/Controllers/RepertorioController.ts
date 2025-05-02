export const RepertorioController: Controller = {
  get_all: async (request, reply) => {
    reply.send({ message: 'get_all repertorios' });
  },
  delete: async (request, reply) => {
    reply.send({ message: 'delete repertorio' });
  },
  comentarioCreate: async (request, reply) => {
    reply.send({ message: 'create comentario' });
  },
};
