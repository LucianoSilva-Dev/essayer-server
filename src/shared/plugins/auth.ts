import jwtPlugin from '@fastify/jwt';
import { fastifyPlugin } from 'fastify-plugin';
import { JWT_SECRET } from '../Env';

export const authPlugin = fastifyPlugin(async (fastify) => {
  fastify.register(jwtPlugin, {
    secret: JWT_SECRET as string,
  });
});
