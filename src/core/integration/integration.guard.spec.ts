import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IntegrationUserGuard } from './integration.guard';
import { IntegrationRepository } from './integration.repository';

describe('IntegrationUserGuard', () => {
  let guard: IntegrationUserGuard;
  let repository: IntegrationRepository;

  const mockRepository = {
    findUserById: vi.fn(),
  };

  beforeEach(() => {
    // biome-ignore lint/suspicious/noExplicitAny: mock for testing
    repository = mockRepository as any;
    guard = new IntegrationUserGuard(repository);
    vi.clearAllMocks();
  });

  function createMockContext(
    overrides: { integrationUser?: Record<string, string>; session?: Record<string, unknown> } = {},
  ) {
    const request = {
      integrationUser: overrides.integrationUser,
      session: overrides.session,
      user: undefined as Record<string, unknown> | undefined,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      // biome-ignore lint/suspicious/noExplicitAny: mock ExecutionContext
    } as any;
  }

  it('should return true and not modify request when no integrationUser', async () => {
    const context = createMockContext({ session: { user: { id: 'original' } } });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(repository.findUserById).not.toHaveBeenCalled();
  });

  it('should return true and not modify request when no session', async () => {
    const context = createMockContext({
      integrationUser: { userId: 'user-1', externalRole: 'student' },
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(repository.findUserById).not.toHaveBeenCalled();
  });

  it('should replace session user with provisioned user when both present', async () => {
    const dbUser = {
      id: 'user-provisioned',
      name: 'John Doe',
      email: 'john@anglo.local',
      emailVerified: true,
      image: null,
      role: 'student',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };
    mockRepository.findUserById.mockResolvedValue(dbUser);

    const context = createMockContext({
      integrationUser: { userId: 'user-provisioned', externalRole: 'student' },
      session: { user: { id: 'service-user' } },
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(repository.findUserById).toHaveBeenCalledWith('user-provisioned');

    const request = context.switchToHttp().getRequest();
    expect(request.session.user).toEqual({
      id: 'user-provisioned',
      name: 'John Doe',
      email: 'john@anglo.local',
      emailVerified: true,
      image: null,
      role: 'student',
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    });
    expect(request.user).toBe(request.session.user);
  });

  it('should use externalRole as fallback when user has no role', async () => {
    const dbUser = {
      id: 'user-2',
      name: 'Jane',
      email: 'jane@anglo.local',
      emailVerified: true,
      image: null,
      role: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };
    mockRepository.findUserById.mockResolvedValue(dbUser);

    const context = createMockContext({
      integrationUser: { userId: 'user-2', externalRole: 'teacher' },
      session: { user: { id: 'service-user' } },
    });

    await guard.canActivate(context);

    const request = context.switchToHttp().getRequest();
    expect(request.session.user.role).toBe('teacher');
  });

  it('should not modify session when user not found in database', async () => {
    mockRepository.findUserById.mockResolvedValue(null);

    const context = createMockContext({
      integrationUser: { userId: 'nonexistent', externalRole: 'student' },
      session: { user: { id: 'service-user' } },
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    const request = context.switchToHttp().getRequest();
    expect(request.session.user).toEqual({ id: 'service-user' });
  });

  it('should return true even when database query fails', async () => {
    mockRepository.findUserById.mockRejectedValue(new Error('DB connection error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const context = createMockContext({
      integrationUser: { userId: 'user-1', externalRole: 'student' },
      session: { user: { id: 'service-user' } },
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();
    const request = context.switchToHttp().getRequest();
    expect(request.session.user).toEqual({ id: 'service-user' });
    consoleSpy.mockRestore();
  });
});
