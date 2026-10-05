import { type CallHandler, type ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessLogInterceptor } from './access-log.interceptor';
import { PrismaService } from '@core/prisma/prisma.service';

describe('AccessLogInterceptor (essayer-server)', () => {
  let interceptor: AccessLogInterceptor;
  let prismaService: {
    accessLog: {
      create: ReturnType<typeof vi.fn>;
    };
  };

  const createMockContext = (reqOverrides: Record<string, unknown> = {}, resOverrides: Record<string, unknown> = {}) => {
    const req = {
      method: 'GET',
      path: '/user-essays',
      url: '/user-essays?status=PENDING',
      headers: {
        'x-forwarded-for': '198.51.100.22',
        'user-agent': 'Essayer-Test-Agent',
      },
      user: { id: 'essayer-user-1' },
      ...reqOverrides,
    };

    const res = {
      statusCode: 200,
      ...resOverrides,
    };

    return {
      getType: vi.fn().mockReturnValue('http'),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue(req),
        getResponse: vi.fn().mockReturnValue(res),
      }),
    } as unknown as ExecutionContext;
  };

  const mockCallHandler: CallHandler = {
    handle: vi.fn().mockReturnValue(of({ data: 'ok' })),
  };

  beforeEach(() => {
    prismaService = {
      accessLog: {
        create: vi.fn().mockResolvedValue({ id: 'log-1' }),
      },
    };

    interceptor = new AccessLogInterceptor(prismaService as unknown as PrismaService);
  });

  it('deve gravar log com userId, IP, método, path e statusCode', async () => {
    const context = createMockContext();

    await new Promise<void>((resolve) => {
      interceptor.intercept(context, mockCallHandler).subscribe({
        complete: () => resolve(),
      });
    });

    expect(prismaService.accessLog.create).toHaveBeenCalledTimes(1);
    expect(prismaService.accessLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'essayer-user-1',
        ipAddress: '198.51.100.22',
        userAgent: 'Essayer-Test-Agent',
        method: 'GET',
        path: '/user-essays',
        statusCode: 200,
      }),
    });
  });

  it('deve calcular expiresAt como createdAt + 180 dias', async () => {
    const context = createMockContext();

    await new Promise<void>((resolve) => {
      interceptor.intercept(context, mockCallHandler).subscribe({
        complete: () => resolve(),
      });
    });

    const callArg = prismaService.accessLog.create.mock.calls[0][0];
    const createdAt = callArg.data.createdAt as Date;
    const expiresAt = callArg.data.expiresAt as Date;

    const diffDays = Math.round(
      (expiresAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    expect(diffDays).toBe(180);
  });

  it('deve ignorar endpoints de health check', async () => {
    const context = createMockContext({ path: '/health', url: '/health' });

    await new Promise<void>((resolve) => {
      interceptor.intercept(context, mockCallHandler).subscribe({
        complete: () => resolve(),
      });
    });

    expect(prismaService.accessLog.create).not.toHaveBeenCalled();
  });

  it('deve gravar userId null para requisições anônimas', async () => {
    const context = createMockContext({ user: undefined });

    await new Promise<void>((resolve) => {
      interceptor.intercept(context, mockCallHandler).subscribe({
        complete: () => resolve(),
      });
    });

    expect(prismaService.accessLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: null,
      }),
    });
  });

  it('deve capturar erro e gravar statusCode correto', async () => {
    const context = createMockContext();
    const failingHandler: CallHandler = {
      handle: vi.fn().mockReturnValue(
        throwError(() => ({ status: 403, message: 'Forbidden' })),
      ),
    };

    await new Promise<void>((resolve) => {
      interceptor.intercept(context, failingHandler).subscribe({
        error: () => resolve(),
      });
    });

    expect(prismaService.accessLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        statusCode: 403,
      }),
    });
  });
});
