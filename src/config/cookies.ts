import type { FastifyCookieOptions } from '@fastify/cookie';
import { COOKIE_SECRET } from '../shared/Env';

export const cookiesConfig: FastifyCookieOptions = {
  secret: COOKIE_SECRET,
};
