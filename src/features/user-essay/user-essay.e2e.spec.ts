import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  closeTestApp,
  createTestApp,
  cleanDatabase,
  type ITestApp,
} from '../../../test/e2e-setup';
import {
  loginAs,
  registerStudent,
  withCookies,
  type ITestUser,
} from '../../../test/utils/auth-helpers';
import { PrismaService } from '@core/prisma/prisma.service';
import { AIResponseStatus } from '@core/prisma/generated/enums';

async function createTestEssay(
  prisma: PrismaService,
  studentId: string,
  overrides?: { text?: string; finished?: boolean },
) {
  return prisma.userEssay.create({
    data: {
      studentId,
      theme: 'Tema de teste para redação',
      text: overrides?.text ?? 'Texto de exemplo para a redação.',
      duration: 1800,
      date: new Date(),
      finished: overrides?.finished ?? false,
    },
  });
}

async function createTestCorrection(
  prisma: PrismaService,
  essayId: string,
  status: AIResponseStatus = AIResponseStatus.PENDING,
) {
  const feedback = await prisma.essayFeedback.create({
    data: {
      gradeC1: 0,
      gradeC2: 0,
      gradeC3: 0,
      gradeC4: 0,
      gradeC5: 0,
      feedbackC1: '',
      feedbackC2: '',
      feedbackC3: '',
      feedbackC4: '',
      feedbackC5: '',
    },
  });

  return prisma.aICorrection.create({
    data: {
      essayId,
      text: 'Texto da correção',
      status,
      feedbackId: feedback.id,
    },
  });
}

describe('UserEssay Correction (E2E)', () => {
  let app: ITestApp;
  let user: ITestUser;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.prisma;
  });

  afterAll(async () => {
    await closeTestApp(app.app);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
    user = await registerStudent(app, {
      email: 'student@test.com',
      name: 'Test Student',
      password: 'Student@123',
    });
  });

  describe('POST /user-essay/:id/correct', () => {
    it('should return 200 and create a correction job', async () => {
      const essay = await createTestEssay(prisma, user.id);
      const { cookies } = await loginAs(app, user.email, user.password);

      const res = await app.server
        .post(`/user-essay/${essay.id}/correct`)
        .set(withCookies(cookies))
        .send({
          theme: 'Tema de teste para redação',
          essayText: 'Texto de exemplo para a redação.',
        })
        .expect(200);

      expect(res.body).toEqual({});

      const corrections = await prisma.aICorrection.findMany({
        where: { essayId: essay.id },
      });
      expect(corrections).toHaveLength(1);
      expect(corrections[0].status).toBe(AIResponseStatus.PENDING);
    });

    it('should return 404 if essay not found', async () => {
      const { cookies } = await loginAs(app, user.email, user.password);

      await app.server
        .post('/user-essay/nonexistent-id/correct')
        .set(withCookies(cookies))
        .send({
          theme: 'Tema',
          essayText: 'Texto.',
        })
        .expect(404);
    });

    it('should return 403 if not the owner', async () => {
      const otherUser = await registerStudent(app, {
        email: 'other@test.com',
        name: 'Other Student',
        password: 'Other@123',
      });

      const essay = await createTestEssay(prisma, user.id);
      const { cookies } = await loginAs(app, otherUser.email, otherUser.password);

      await app.server
        .post(`/user-essay/${essay.id}/correct`)
        .set(withCookies(cookies))
        .send({
          theme: 'Tema de teste para redação',
          essayText: 'Texto de exemplo para a redação.',
        })
        .expect(403);
    });

    it('should return 409 if correction already in progress', async () => {
      const essay = await createTestEssay(prisma, user.id);
      await createTestCorrection(prisma, essay.id, AIResponseStatus.PENDING);
      const { cookies } = await loginAs(app, user.email, user.password);

      await app.server
        .post(`/user-essay/${essay.id}/correct`)
        .set(withCookies(cookies))
        .send({
          theme: 'Tema de teste para redação',
          essayText: 'Texto de exemplo para a redação.',
        })
        .expect(409);
    });

    it('should return 401 without authentication', async () => {
      const essay = await createTestEssay(prisma, user.id);

      await app.server
        .post(`/user-essay/${essay.id}/correct`)
        .send({
          theme: 'Tema',
          essayText: 'Texto.',
        })
        .expect(401);
    });
  });

  describe('GET /user-essay/:id/correction/listen', () => {
    it.skip('should return 200 with SSE content-type', async () => {
      const essay = await createTestEssay(prisma, user.id);
      const { cookies } = await loginAs(app, user.email, user.password);

      const res = await new Promise<any>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('SSE connection timeout'));
        }, 10000);

        const req = app.server
          .get(`/user-essay/${essay.id}/correction/listen`)
          .set(withCookies(cookies))
          .buffer(false)
          .parse((res: any, callback: any) => {
            clearTimeout(timeout);
            resolve(res);
            res.destroy();
            callback();
          });

        setTimeout(() => {
          req.abort();
        }, 3000);
      });

      expect(res.headers['content-type']).toContain('text/event-stream');
    });

    it('should return 401 without authentication', async () => {
      const essay = await createTestEssay(prisma, user.id);

      await app.server
        .get(`/user-essay/${essay.id}/correction/listen`)
        .expect(401);
    });
  });

  describe('DELETE /user-essay/:id/correction/:correctionId', () => {
    it('should return 200 and delete the correction', async () => {
      const essay = await createTestEssay(prisma, user.id);
      const correction = await createTestCorrection(prisma, essay.id);
      const { cookies } = await loginAs(app, user.email, user.password);

      await app.server
        .delete(`/user-essay/${essay.id}/correction/${correction.id}`)
        .set(withCookies(cookies))
        .expect(200);

      const deleted = await prisma.aICorrection.findUnique({
        where: { id: correction.id },
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 if essay not found', async () => {
      const { cookies } = await loginAs(app, user.email, user.password);

      await app.server
        .delete('/user-essay/nonexistent-id/correction/some-correction-id')
        .set(withCookies(cookies))
        .expect(404);
    });

    it('should return 403 if not the owner', async () => {
      const otherUser = await registerStudent(app, {
        email: 'other@test.com',
        name: 'Other Student',
        password: 'Other@123',
      });

      const essay = await createTestEssay(prisma, user.id);
      const correction = await createTestCorrection(prisma, essay.id);
      const { cookies } = await loginAs(app, otherUser.email, otherUser.password);

      await app.server
        .delete(`/user-essay/${essay.id}/correction/${correction.id}`)
        .set(withCookies(cookies))
        .expect(403);
    });

    it('should return 401 without authentication', async () => {
      const essay = await createTestEssay(prisma, user.id);
      const correction = await createTestCorrection(prisma, essay.id);

      await app.server
        .delete(`/user-essay/${essay.id}/correction/${correction.id}`)
        .expect(401);
    });
  });

  describe('POST /user-essay/:id/correction/:correctionId/retry', () => {
    it('should return 404 if essay not found', async () => {
      const { cookies } = await loginAs(app, user.email, user.password);

      await app.server
        .post('/user-essay/nonexistent-id/correction/some-correction-id/retry')
        .set(withCookies(cookies))
        .expect(404);
    });

    it('should return 403 if not the owner', async () => {
      const otherUser = await registerStudent(app, {
        email: 'other@test.com',
        name: 'Other Student',
        password: 'Other@123',
      });

      const essay = await createTestEssay(prisma, user.id);
      const correction = await createTestCorrection(
        prisma,
        essay.id,
        AIResponseStatus.ERROR,
      );
      const { cookies } = await loginAs(app, otherUser.email, otherUser.password);

      await app.server
        .post(`/user-essay/${essay.id}/correction/${correction.id}/retry`)
        .set(withCookies(cookies))
        .expect(403);
    });

    it('should return 404 if correction not found', async () => {
      const essay = await createTestEssay(prisma, user.id);
      const { cookies } = await loginAs(app, user.email, user.password);

      await app.server
        .post(`/user-essay/${essay.id}/correction/nonexistent-correction/retry`)
        .set(withCookies(cookies))
        .expect(404);
    });

    it('should return 409 if correction is not in ERROR status', async () => {
      const essay = await createTestEssay(prisma, user.id);
      const correction = await createTestCorrection(
        prisma,
        essay.id,
        AIResponseStatus.FINISHED,
      );
      const { cookies } = await loginAs(app, user.email, user.password);

      await app.server
        .post(`/user-essay/${essay.id}/correction/${correction.id}/retry`)
        .set(withCookies(cookies))
        .expect(409);
    });

    it('should return 409 if correction is PENDING (not ERROR)', async () => {
      const essay = await createTestEssay(prisma, user.id);
      const correction = await createTestCorrection(
        prisma,
        essay.id,
        AIResponseStatus.PENDING,
      );
      const { cookies } = await loginAs(app, user.email, user.password);

      await app.server
        .post(`/user-essay/${essay.id}/correction/${correction.id}/retry`)
        .set(withCookies(cookies))
        .expect(409);
    });

    it('should return 401 without authentication', async () => {
      const essay = await createTestEssay(prisma, user.id);
      const correction = await createTestCorrection(
        prisma,
        essay.id,
        AIResponseStatus.ERROR,
      );

      await app.server
        .post(`/user-essay/${essay.id}/correction/${correction.id}/retry`)
        .expect(401);
    });
  });

  describe('GET /user-essay/:id', () => {
    it('should return corrections in response', async () => {
      const essay = await createTestEssay(prisma, user.id);
      await createTestCorrection(prisma, essay.id, AIResponseStatus.PENDING);
      const { cookies } = await loginAs(app, user.email, user.password);

      const res = await app.server
        .get(`/user-essay/${essay.id}`)
        .set(withCookies(cookies))
        .expect(200);

      expect(res.body).toMatchObject({
        id: essay.id,
        theme: essay.theme,
        corrections: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            status: 'PENDING',
          }),
        ]),
      });
      expect(res.body.corrections).toHaveLength(1);
    });

    it('should return finished correction with feedback data', async () => {
      const essay = await createTestEssay(prisma, user.id);
      const feedback = await prisma.essayFeedback.create({
        data: {
          gradeC1: 8,
          gradeC2: 7,
          gradeC3: 9,
          gradeC4: 6,
          gradeC5: 8,
          feedbackC1: 'Good coherence',
          feedbackC2: 'Adequate vocabulary',
          feedbackC3: 'Excellent grammar',
          feedbackC4: 'Needs improvement',
          feedbackC5: 'Good structure',
        },
      });
      await prisma.aICorrection.create({
        data: {
          essayId: essay.id,
          text: 'Texto da correção',
          status: AIResponseStatus.FINISHED,
          feedbackId: feedback.id,
        },
      });

      const { cookies } = await loginAs(app, user.email, user.password);

      const res = await app.server
        .get(`/user-essay/${essay.id}`)
        .set(withCookies(cookies))
        .expect(200);

      expect(res.body.corrections).toHaveLength(1);
      expect(res.body.corrections[0]).toMatchObject({
        status: 'FINISHED',
        gradeC1: 8,
        gradeC2: 7,
        gradeC3: 9,
        gradeC4: 6,
        gradeC5: 8,
        feedbackC1: 'Good coherence',
        feedbackC2: 'Adequate vocabulary',
        feedbackC3: 'Excellent grammar',
        feedbackC4: 'Needs improvement',
        feedbackC5: 'Good structure',
      });
    });

    it('should return empty corrections array when essay has none', async () => {
      const essay = await createTestEssay(prisma, user.id);
      const { cookies } = await loginAs(app, user.email, user.password);

      const res = await app.server
        .get(`/user-essay/${essay.id}`)
        .set(withCookies(cookies))
        .expect(200);

      expect(res.body.corrections).toEqual([]);
    });

    it('should return 403 if not the owner', async () => {
      const otherUser = await registerStudent(app, {
        email: 'other@test.com',
        name: 'Other Student',
        password: 'Other@123',
      });

      const essay = await createTestEssay(prisma, user.id);
      const { cookies } = await loginAs(app, otherUser.email, otherUser.password);

      await app.server
        .get(`/user-essay/${essay.id}`)
        .set(withCookies(cookies))
        .expect(403);
    });

    it('should return 404 if essay not found', async () => {
      const { cookies } = await loginAs(app, user.email, user.password);

      await app.server
        .get('/user-essay/nonexistent-id')
        .set(withCookies(cookies))
        .expect(404);
    });
  });
});
