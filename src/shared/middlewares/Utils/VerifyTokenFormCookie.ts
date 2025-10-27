import type { FastifyReply, FastifyRequest } from 'fastify';

export async function verifyTokenFromCookie(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<boolean> {
  try {
    await request.jwtVerify();
    return true;
  } catch (err) {
    console.error('JWT Verification Error:', err);
    reply.status(401).send({ error: 'Login necessário.' });
    return false;
  }
}
