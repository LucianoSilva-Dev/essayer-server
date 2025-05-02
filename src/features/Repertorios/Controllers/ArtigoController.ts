export const ArtigoController: Controller = {
  artigoGet: async (request, reply) => {
    reply.send({ message: 'get artigo' });
  },
  artigoCreate: async (request, reply) => {
    reply.send({ message: 'create artigo' });
  },
  artigoUpdate: async (request, reply) => {
    reply.send({ message: 'update artigo' });
  },
};
