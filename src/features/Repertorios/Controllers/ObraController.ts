export const ObraController: Controller = {
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
