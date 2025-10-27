import type { FastifyReply } from "fastify";

export function clearReplyCookies(reply: FastifyReply) {
    reply.clearCookie('accessToken', { path: '/' });
    reply.clearCookie('refreshToken', { path: '/auth/refresh' });
}