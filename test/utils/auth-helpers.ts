import { PrismaService } from '@core/prisma/prisma.service';
import type { ITestApp } from '../e2e-setup';

export interface ITestUser {
  id: string;
  email: string;
  name: string;
  password: string;
  cookies: string[];
}

export async function registerUser(
  app: ITestApp,
  overrides?: Partial<{ name: string; email: string; password: string }>,
): Promise<ITestUser> {
  const email = overrides?.email ?? `test-${Date.now()}@example.com`;
  const password = overrides?.password ?? 'Test@123456';
  const name = overrides?.name ?? 'Test User';

  const res = await app.server.post('/auth/sign-up/email').send({ email, password, name });

  const cookies = res.get('Set-Cookie') ?? [];
  const id = res.body?.user?.id ?? '';

  return { id, email, name, password, cookies };
}

export async function loginUser(
  app: ITestApp,
  email: string,
  password: string,
): Promise<{ cookies: string[] }> {
  const res = await app.server.post('/auth/sign-in/email').send({ email, password });
  return { cookies: res.get('Set-Cookie') ?? [] };
}

export async function registerStudent(
  app: ITestApp,
  overrides?: Partial<{ name: string; email: string; password: string }>,
): Promise<ITestUser> {
  const user = await registerUser(app, overrides);

  const prisma = app.app.get(PrismaService);
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true },
  });

  return user;
}

export async function loginAs(
  app: ITestApp,
  email: string,
  password: string,
): Promise<{ cookies: string[] }> {
  return loginUser(app, email, password);
}

export function withCookies(cookies: string[]): { cookie: string } {
  return { cookie: cookies.join('; ') };
}
