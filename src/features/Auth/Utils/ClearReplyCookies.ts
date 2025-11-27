import type { FastifyReply } from "fastify";
import { ACCESS_TOKEN_COOKIE_PATH, AppCookies, REFRESH_TOKEN_COOKIE_PATH } from "../../../shared/Constants/auth";
import { commonCookieOptions } from "./CommonCookieOptions";

const accessTokenCookieOptions = commonCookieOptions(0, ACCESS_TOKEN_COOKIE_PATH);
const refreshTokenCookieOptions = commonCookieOptions(0, REFRESH_TOKEN_COOKIE_PATH);

export function clearReplyCookies(reply: FastifyReply) {
    reply.clearCookie(AppCookies.accessToken, accessTokenCookieOptions);
    reply.clearCookie(AppCookies.refreshToken, refreshTokenCookieOptions);

    console.log('accessTokenCookieOptions', accessTokenCookieOptions);
    console.log('refreshTokenCookieOptions', refreshTokenCookieOptions);
}