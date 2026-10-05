import { type ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TermsAcceptanceGuard } from './terms-acceptance.guard';
import { LegalService } from './legal.service';

describe('TermsAcceptanceGuard (essayer-server)', () => {
  let guard: TermsAcceptanceGuard;
  let legalService: {
    getTermsStatus: ReturnType<typeof vi.fn>;
  };
  let reflector: {
    getAllAndOverride: ReturnType<typeof vi.fn>;
  };

  const createMockContext = (
    user: { id?: string } | null = { id: 'essayer-user-123' },
    handler = () => {},
    targetClass = class {},
  ) => {
    return {
      getHandler: () => handler,
      getClass: () => targetClass,
      switchToHttp: () => ({
        getRequest: () => ({
          user,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    legalService = {
      getTermsStatus: vi.fn(),
    };
    reflector = {
      getAllAndOverride: vi.fn(),
    };

    guard = new TermsAcceptanceGuard(
      legalService as unknown as LegalService,
      reflector as unknown as Reflector,
    );
  });

  it('deve permitir acesso quando usuário aceitou Termos', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    legalService.getTermsStatus.mockResolvedValue({
      accepted: true,
      currentVersion: '2026-09-01',
    });

    const context = createMockContext({ id: 'user-accepted' });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(legalService.getTermsStatus).toHaveBeenCalledWith('user-accepted');
  });

  it('deve lançar ForbiddenException quando Termos pendentes', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    legalService.getTermsStatus.mockResolvedValue({
      accepted: false,
      currentVersion: '2026-09-01',
    });

    const context = createMockContext({ id: 'user-pending' });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);

    try {
      await guard.canActivate(context);
    } catch (err) {
      expect(err).toBeInstanceOf(ForbiddenException);
      const response = (err as ForbiddenException).getResponse() as Record<string, unknown>;
      expect(response.code).toBe('TERMS_NOT_ACCEPTED');
      expect(response.currentVersion).toBe('2026-09-01');
    }
  });

  it('deve ignorar verificação em rotas com @SkipTermsCheck()', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    const context = createMockContext({ id: 'user-pending' });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(legalService.getTermsStatus).not.toHaveBeenCalled();
  });

  it('deve permitir acesso para rotas anônimas', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    const context = createMockContext(null);
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(legalService.getTermsStatus).not.toHaveBeenCalled();
  });
});
