import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { closeTestApp, createTestApp, cleanDatabase, type ITestApp } from '../../../test/e2e-setup';
import { registerUser } from '../../../test/utils/auth-helpers';
import { PrismaService } from '@core/prisma/prisma.service';

describe('Legal Terms Acceptance (essayer-server E2E)', () => {
  let app: ITestApp;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(app.app);
  });

  beforeEach(async () => {
    await cleanDatabase(app.prisma);
  });

  it('deve retornar 401 sem sessão para /legal/terms/status', async () => {
    const res = await app.server.get('/legal/terms/status');
    expect(res.status).toBe(401);
  });

  it('deve retornar accepted=false para usuário sem aceite', async () => {
    const user = await registerUser(app, {
      email: 'essayer-terms@test.com',
      password: 'Test@123456',
      name: 'Essayer Terms Student',
    });

    const prisma = app.app.get(PrismaService);
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    const res = await app.server
      .get('/legal/terms/status')
      .set('Cookie', user.cookies);

    expect(res.status).toBe(200);
    expect(res.body.accepted).toBe(false);
    expect(res.body.acceptedAt).toBeNull();
    expect(res.body).toHaveProperty('currentVersion');
  });

  it('deve registrar aceite e retornar accepted=true após POST /legal/terms/accept', async () => {
    const user = await registerUser(app, {
      email: 'essayer-accept@test.com',
      password: 'Test@123456',
      name: 'Essayer Accept',
    });

    const prisma = app.app.get(PrismaService);
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    // 1) POST accept
    const acceptRes = await app.server
      .post('/legal/terms/accept')
      .set('Cookie', user.cookies);

    expect(acceptRes.status).toBe(201);
    expect(acceptRes.body.accepted).toBe(true);

    // 2) GET status
    const statusRes = await app.server
      .get('/legal/terms/status')
      .set('Cookie', user.cookies);

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.accepted).toBe(true);
    expect(statusRes.body.acceptedAt).not.toBeNull();
  });

  it('deve retornar 403 TERMS_NOT_ACCEPTED ao acessar endpoint protegido sem aceite', async () => {
    const user = await registerUser(app, {
      email: 'essayer-blocked@test.com',
      password: 'Test@123456',
      name: 'Essayer Blocked',
    });

    const prisma = app.app.get(PrismaService);
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    // Endpoint protegido: GET /users/me
    const res = await app.server
      .get('/users/me')
      .set('Cookie', user.cookies);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('TERMS_NOT_ACCEPTED');
  });
});
