import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { closeTestApp, createTestApp, cleanDatabase, type ITestApp } from '../../../test/e2e-setup';
import {
  loginAs,
  registerStudent,
  withCookies,
  type ITestUser,
} from '../../../test/utils/auth-helpers';
import { PrismaService } from '@core/prisma/prisma.service';

async function createTestClass(prisma: PrismaService, creatorId: string) {
  return prisma.class.create({
    data: {
      name: 'Test Class',
      code: `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      creatorId,
    },
  });
}

async function createTestActivity(prisma: PrismaService, classId: string) {
  return prisma.activity.create({
    data: {
      title: 'Test Activity',
      description: 'Test Description',
      type: 'ESSAY',
      classId,
    },
  });
}

async function createTestTeacherRequest(prisma: PrismaService, userId: string) {
  return prisma.teacherRequest.create({
    data: {
      lattes: 'https://lattes.cnpq.br/test',
      userId,
    },
  });
}

describe('Notification (E2E)', () => {
  let app: ITestApp;
  let user: ITestUser;
  let prisma: PrismaService;
  let testClass: { id: string };
  let testActivity: { id: string };
  let testTeacherRequest: { id: string };

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.prisma;
  });

  afterAll(async () => {
    await closeTestApp(app.app);
  });

  beforeEach(async () => {
    await cleanDatabase(app.prisma);
    user = await registerStudent(app, {
      email: 'student@test.com',
      name: 'Test Student',
      password: 'Student@123',
    });
    testClass = await createTestClass(prisma, user.id);
    testActivity = await createTestActivity(prisma, testClass.id);
    testTeacherRequest = await createTestTeacherRequest(prisma, user.id);
  });

  describe('GET /notification', () => {
    it('should return empty array when user has no notifications (200)', async () => {
      const { cookies } = await loginAs(app, user.email, user.password);
      const res = await app.server
        .get('/notification')
        .set(withCookies(cookies))
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('should return notifications for the authenticated user (200)', async () => {
      const { cookies } = await loginAs(app, user.email, user.password);

      await prisma.notification.create({
        data: {
          type: 'ACTIVITY_SENT',
          senders: { connect: { id: user.id } },
          activityNotification: {
            create: { activityId: testActivity.id },
          },
        },
      });

      const res = await app.server
        .get('/notification')
        .set(withCookies(cookies))
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        id: expect.any(String),
        type: 'ACTIVITY_SENT',
        read: false,
        activityId: testActivity.id,
      });
    });

    it('should return read status correctly based on seenBy', async () => {
      const { cookies } = await loginAs(app, user.email, user.password);

      const activity2 = await createTestActivity(prisma, testClass.id);

      await prisma.notification.create({
        data: {
          type: 'ACTIVITY_CORRECTED',
          senders: { connect: { id: user.id } },
          seenBy: { connect: { id: user.id } },
          activityNotification: {
            create: { activityId: activity2.id },
          },
        },
      });

      const res = await app.server
        .get('/notification')
        .set(withCookies(cookies))
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].read).toBe(true);
    });

    it('should return teacher request status notifications with motivo', async () => {
      const { cookies } = await loginAs(app, user.email, user.password);

      await prisma.notification.create({
        data: {
          type: 'TEACHER_REQUEST_STATUS',
          senders: { connect: { id: user.id } },
          teacherRequestStatus: {
            create: {
              teacherRequestId: testTeacherRequest.id,
              motivo: 'Missing documents',
            },
          },
        },
      });

      const res = await app.server
        .get('/notification')
        .set(withCookies(cookies))
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        type: 'TEACHER_REQUEST_STATUS',
        read: false,
        teacherRequestId: testTeacherRequest.id,
        reason: 'Missing documents',
      });
    });

    it('should not return notifications for other users', async () => {
      const otherUser = await registerStudent(app, {
        email: 'other@test.com',
        name: 'Other Student',
        password: 'Other@123',
      });

      await prisma.notification.create({
        data: {
          type: 'ACTIVITY_SENT',
          senders: { connect: { id: otherUser.id } },
          activityNotification: {
            create: { activityId: testActivity.id },
          },
        },
      });

      const { cookies } = await loginAs(app, user.email, user.password);
      const res = await app.server
        .get('/notification')
        .set(withCookies(cookies))
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('should return 401 without authentication', async () => {
      await app.server.get('/notification').expect(401);
    });
  });

  describe('PUT /notification', () => {
    it('should mark notifications as read (200)', async () => {
      const { cookies } = await loginAs(app, user.email, user.password);

      const notification = await prisma.notification.create({
        data: {
          type: 'ACTIVITY_SENT',
          senders: { connect: { id: user.id } },
          activityNotification: {
            create: { activityId: testActivity.id },
          },
        },
      });

      const res = await app.server
        .put('/notification')
        .set(withCookies(cookies))
        .send({ notificationIds: [notification.id] })
        .expect(200);

      expect(res.body).toEqual({});

      const updated = await prisma.notification.findUnique({
        where: { id: notification.id },
        include: { seenBy: true },
      });
      expect(updated!.seenBy).toHaveLength(1);
      expect(updated!.seenBy[0].id).toBe(user.id);
    });

    it('should mark multiple notifications as read', async () => {
      const { cookies } = await loginAs(app, user.email, user.password);

      const activity2 = await createTestActivity(prisma, testClass.id);

      const n1 = await prisma.notification.create({
        data: {
          type: 'ACTIVITY_SENT',
          senders: { connect: { id: user.id } },
          activityNotification: { create: { activityId: testActivity.id } },
        },
      });

      const n2 = await prisma.notification.create({
        data: {
          type: 'ACTIVITY_CORRECTED',
          senders: { connect: { id: user.id } },
          activityNotification: { create: { activityId: activity2.id } },
        },
      });

      await app.server
        .put('/notification')
        .set(withCookies(cookies))
        .send({ notificationIds: [n1.id, n2.id] })
        .expect(200);

      const [u1, u2] = await Promise.all([
        prisma.notification.findUnique({ where: { id: n1.id }, include: { seenBy: true } }),
        prisma.notification.findUnique({ where: { id: n2.id }, include: { seenBy: true } }),
      ]);
      expect(u1!.seenBy).toHaveLength(1);
      expect(u2!.seenBy).toHaveLength(1);
    });

    it('should return 400 with empty notificationIds', async () => {
      const { cookies } = await loginAs(app, user.email, user.password);

      await app.server
        .put('/notification')
        .set(withCookies(cookies))
        .send({ notificationIds: [] })
        .expect(400);
    });

    it('should return 400 with invalid payload', async () => {
      const { cookies } = await loginAs(app, user.email, user.password);

      await app.server
        .put('/notification')
        .set(withCookies(cookies))
        .send({ invalid: true })
        .expect(400);
    });

    it('should return 400 with empty strings in notificationIds', async () => {
      const { cookies } = await loginAs(app, user.email, user.password);

      await app.server
        .put('/notification')
        .set(withCookies(cookies))
        .send({ notificationIds: [''] })
        .expect(400);
    });

    it('should return 401 without authentication', async () => {
      await app.server
        .put('/notification')
        .send({ notificationIds: ['some-id'] })
        .expect(401);
    });
  });

  describe('@Sse /notification/listen', () => {
    it('should return 401 without authentication', async () => {
      await app.server.get('/notification/listen').expect(401);
    });
  });
});
