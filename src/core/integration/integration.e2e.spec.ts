import { auth } from '@core/auth/auth';
import { PrismaService } from '@core/prisma/prisma.service';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { closeTestApp, cleanDatabase, createTestApp, type ITestApp } from '../../../test/e2e-setup';
import { registerStudent, withCookies, loginAs } from '../../../test/utils/auth-helpers';

async function createServiceUser(prisma: PrismaService) {
  return prisma.user.create({
    data: {
      email: 'test-service@incita.local',
      name: 'Test Service User',
      emailVerified: true,
      role: 'admin',
    },
  });
}

async function createApiKeyForUser(serviceUserId: string): Promise<string> {
  const result = await auth.api.createApiKey({
    body: {
      name: 'test-key',
      userId: serviceUserId,
      metadata: { integrationName: 'test-integration' },
    },
  });

  if (!result.key) {
    throw new Error(`Failed to create API key: ${JSON.stringify(result)}`);
  }
  return result.key;
}

describe('Integration API Key Auth (E2E)', () => {
  let app: ITestApp;
  let prisma: PrismaService;
  let serviceUser: Awaited<ReturnType<typeof createServiceUser>>;
  let apiKey: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.prisma;
  });

  afterAll(async () => {
    await closeTestApp(app.app);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);

    serviceUser = await createServiceUser(prisma);
    apiKey = await createApiKeyForUser(serviceUser.id);
  });

  describe('API Key authentication', () => {
    it('should return 403 with invalid API key', async () => {
      await app.server.get('/repertoire').set('x-api-key', 'invalid-key-12345').expect(403);
    });

    it('should return 200 with valid API key on @OptionalAuth() endpoint', async () => {
      await app.server.get('/repertoire').set('x-api-key', apiKey).expect(200);
    });

    it('should work normally with cookie auth (no API key)', async () => {
      const user = await registerStudent(app);
      const { cookies } = await loginAs(app, user.email, user.password);

      await app.server.get('/repertoire').set(withCookies(cookies)).expect(200);
    });
  });

  describe('Integration user auto-provisioning', () => {
    it('should auto-provision user on first request with integration headers', async () => {
      const usersBefore = await prisma.user.findMany({
        where: { email: 'student-auto@anglo.local' },
      });
      expect(usersBefore).toHaveLength(0);

      await app.server
        .get('/repertoire')
        .set('x-api-key', apiKey)
        .set('x-integration-name', 'anglo-platform')
        .set('x-integration-user-id', 'ext-student-001')
        .set('x-integration-user-name', 'Auto Student')
        .set('x-integration-user-email', 'student-auto@anglo.local')
        .set('x-integration-user-role', 'student')
        .expect(200);

      const usersAfter = await prisma.user.findMany({
        where: { email: 'student-auto@anglo.local' },
      });
      expect(usersAfter).toHaveLength(1);
      expect(usersAfter[0].emailVerified).toBe(true);

      const mappings = await prisma.integrationUser.findMany({
        where: { externalUserId: 'ext-student-001' },
      });
      expect(mappings).toHaveLength(1);
      expect(mappings[0].integrationName).toBe('anglo-platform');
      expect(mappings[0].userId).toBe(usersAfter[0].id);
    });

    it('should reuse provisioned user on subsequent requests', async () => {
      await app.server
        .get('/repertoire')
        .set('x-api-key', apiKey)
        .set('x-integration-name', 'anglo-platform')
        .set('x-integration-user-id', 'ext-student-002')
        .set('x-integration-user-name', 'Reuse Student')
        .set('x-integration-user-email', 'student-reuse@anglo.local')
        .expect(200);

      const usersAfterFirst = await prisma.user.findMany({
        where: { email: 'student-reuse@anglo.local' },
      });
      expect(usersAfterFirst).toHaveLength(1);

      await app.server
        .get('/repertoire')
        .set('x-api-key', apiKey)
        .set('x-integration-name', 'anglo-platform')
        .set('x-integration-user-id', 'ext-student-002')
        .set('x-integration-user-name', 'Reuse Student')
        .set('x-integration-user-email', 'student-reuse@anglo.local')
        .expect(200);

      const usersAfterSecond = await prisma.user.findMany({
        where: { email: 'student-reuse@anglo.local' },
      });
      expect(usersAfterSecond).toHaveLength(1);

      const mappings = await prisma.integrationUser.findMany({
        where: { externalUserId: 'ext-student-002' },
      });
      expect(mappings).toHaveLength(1);
    });

    it('should link to existing user when email matches', async () => {
      const existingUser = await prisma.user.create({
        data: {
          email: 'existing@anglo.local',
          name: 'Existing User',
          emailVerified: true,
          role: 'student',
        },
      });

      await app.server
        .get('/repertoire')
        .set('x-api-key', apiKey)
        .set('x-integration-name', 'anglo-platform')
        .set('x-integration-user-id', 'ext-existing-001')
        .set('x-integration-user-name', 'Existing User')
        .set('x-integration-user-email', 'existing@anglo.local')
        .expect(200);

      const mappings = await prisma.integrationUser.findMany({
        where: { externalUserId: 'ext-existing-001' },
      });
      expect(mappings).toHaveLength(1);
      expect(mappings[0].userId).toBe(existingUser.id);

      const allUsers = await prisma.user.findMany({
        where: { email: 'existing@anglo.local' },
      });
      expect(allUsers).toHaveLength(1);
    });
  });

  describe('Role-based access with integration users', () => {
    it('should allow student to access @OptionalAuth() endpoints via API key', async () => {
      await app.server
        .get('/repertoire')
        .set('x-api-key', apiKey)
        .set('x-integration-name', 'anglo-platform')
        .set('x-integration-user-id', 'ext-student-role')
        .set('x-integration-user-name', 'Role Student')
        .set('x-integration-user-email', 'role-student@anglo.local')
        .set('x-integration-user-role', 'student')
        .expect(200);
    });

    it('should allow teacher to access @Roles() endpoints via API key', async () => {
      await app.server
        .get('/repertoire')
        .set('x-api-key', apiKey)
        .set('x-integration-name', 'anglo-platform')
        .set('x-integration-user-id', 'ext-teacher-role')
        .set('x-integration-user-name', 'Role Teacher')
        .set('x-integration-user-email', 'role-teacher@anglo.local')
        .set('x-integration-user-role', 'teacher')
        .expect(200);
    });
  });

  describe('Integration headers without API key', () => {
    it('should ignore integration headers when no API key is present', async () => {
      await app.server
        .get('/repertoire')
        .set('x-integration-user-id', 'ext-1')
        .set('x-integration-user-name', 'No Key User')
        .expect(200);

      const mappings = await prisma.integrationUser.findMany();
      expect(mappings).toHaveLength(0);
    });
  });
});
