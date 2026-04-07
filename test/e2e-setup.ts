import { PrismaService } from '@core/prisma/prisma.service';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setAppContext } from '../src/app.registry';

export interface ITestApp {
  app: INestApplication;
  prisma: PrismaService;
  server: ReturnType<typeof request>;
}

export async function createTestApp(): Promise<ITestApp> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  const prisma = app.get(PrismaService);

  setAppContext(app);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use(cookieParser('test-secret'));

  await app.init();

  return { app, prisma, server: request(app.getHttpServer()) };
}

export async function cleanDatabase(prisma: PrismaService) {
  const result = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;

  for (const { tablename } of result) {
    if (tablename === '_prisma_migrations') continue;
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE`);
  }
}

export async function closeTestApp(app: INestApplication) {
  await app.close();
}
