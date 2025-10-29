import jwtPlugin from '@fastify/jwt';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { fastifyPlugin } from 'fastify-plugin';
import { JWT_TOKEN_SECRET } from '../Env'; // Importar ambos os segredos

export const authPlugin = fastifyPlugin(async (fastify) => {
  fastify.register(jwtPlugin, {
    secret: JWT_TOKEN_SECRET,
  });

  fastify.decorate(
    'verifyRefreshToken',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const token = request.cookies.refreshToken;
        if (!token) {
          throw new Error('Refresh token cookie not found');
        }
        const decoded = fastify.jwt.verify(token);
        return decoded;
      } catch (err) {
        reply.code(401).send({ error: 'Invalid or expired refresh token.' });
      }
    },
  );
});

declare module 'fastify' {
  interface FastifyInstance {
    verifyRefreshToken: (
      request: FastifyRequest,
      reply: FastifyReply,
      // biome-ignore lint/suspicious/noExplicitAny: expected behavior
    ) => Promise<any | undefined>;
  }
}

// Atualize a interface do Request para incluir o payload (opcional)
// declare module '@fastify/jwt' {
//  interface FastifyJWT {
//    payload: { userId: string, sessionId: string } // Exemplo para Refresh Token Payload
//    user: RequestUserData // Para Access Token Payload (já deve existir se configurado)
//  }
//}
