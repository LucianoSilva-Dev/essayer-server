import type { FastifyReply, FastifyRequest } from 'fastify';

export async function verifyTokenFromCookie(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<boolean> {
  try {
    const cookie = request.cookies.accessToken;

    if (!cookie) {
      reply.status(401).send({ error: 'Login necessário' });
      return false;
    }

    const payload = request.server.jwt.verify(cookie);
    request.user = payload;
    return true;
  } catch (err) {
    console.error('JWT Verification Error:', err);
    reply.status(401).send({ error: 'Login necessário.' });
    return false;
  }
}
