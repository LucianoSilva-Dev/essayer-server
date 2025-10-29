import type { FastifyReply } from "fastify";
import { ACCESS_TOKEN_COOKIE_PATH, REFRESH_TOKEN_COOKIE_PATH } from "../../../shared/Constants/auth";

export function clearReplyCookies(reply: FastifyReply) {
    reply.clearCookie('accessToken', { path: ACCESS_TOKEN_COOKIE_PATH });
    reply.clearCookie('refreshToken', { path: REFRESH_TOKEN_COOKIE_PATH });
}