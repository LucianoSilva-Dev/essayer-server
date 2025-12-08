import type { CookieSerializeOptions } from '@fastify/cookie';
import { ENVIRONMENT } from '../../../shared/Env';

export function commonCookieOptions(
  maxAgeSeconds: number,
  path: string = '/',
): CookieSerializeOptions {
  return {
    path: path,
    httpOnly: true,
    secure: ENVIRONMENT === 'production',
    sameSite: 'lax' as const,
    maxAge: maxAgeSeconds,
    signed: true,
  };
}
