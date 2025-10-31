import type { FastifyReply } from "fastify";
import { ACCESS_TOKEN_COOKIE_PATH, AppCookies, REFRESH_TOKEN_COOKIE_PATH } from "../../../shared/Constants/auth";

export function clearReplyCookies(reply: FastifyReply) {
    reply.clearCookie(AppCookies.accessToken, { path: ACCESS_TOKEN_COOKIE_PATH });
    reply.clearCookie(AppCookies.refreshToken, { path: REFRESH_TOKEN_COOKIE_PATH });
}