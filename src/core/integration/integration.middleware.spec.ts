import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IntegrationUserMiddleware } from './integration.middleware';
import { IntegrationService } from './integration.service';

describe('IntegrationUserMiddleware', () => {
  let middleware: IntegrationUserMiddleware;
  let integrationService: IntegrationService;

  const mockIntegrationService = {
    resolveOrCreateUser: vi.fn(),
  };

  beforeEach(() => {
    // biome-ignore lint/suspicious/noExplicitAny: mock for testing
    integrationService = mockIntegrationService as any;
    middleware = new IntegrationUserMiddleware(integrationService);
    vi.clearAllMocks();
  });

  function createMockRequest(headers: Record<string, string | undefined> = {}) {
    return {
      headers,
      integrationUser: undefined as Record<string, unknown> | undefined,
      // biome-ignore lint/suspicious/noExplicitAny: mock Express Request
    } as any;
  }

  // biome-ignore lint/suspicious/noExplicitAny: mock Express Response
  function createMockResponse(): any {
    return {};
  }

  function createMockNext() {
    return vi.fn();
  }

  it('should call next() immediately when no x-integration-user-id header', async () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    await middleware.use(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(mockIntegrationService.resolveOrCreateUser).not.toHaveBeenCalled();
    expect(req.integrationUser).toBeUndefined();
  });

  it('should call next() when x-integration-user-id present but no x-api-key', async () => {
    const req = createMockRequest({ 'x-integration-user-id': 'ext-1' });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware.use(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(mockIntegrationService.resolveOrCreateUser).not.toHaveBeenCalled();
    expect(req.integrationUser).toBeUndefined();
  });

  it('should resolve user and set integrationUser when both headers present', async () => {
    const resolvedUser = {
      userId: 'user-1',
      externalUserId: 'ext-1',
      externalRole: 'student',
      integrationName: 'anglo-platform',
      isNewUser: true,
    };
    mockIntegrationService.resolveOrCreateUser.mockResolvedValue(resolvedUser);

    const req = createMockRequest({
      'x-api-key': 'test-api-key',
      'x-integration-user-id': 'ext-1',
      'x-integration-name': 'anglo-platform',
      'x-integration-user-role': 'student',
      'x-integration-user-name': 'John',
      'x-integration-user-email': 'john@anglo.local',
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware.use(req, res, next);

    expect(mockIntegrationService.resolveOrCreateUser).toHaveBeenCalledWith(
      'anglo-platform',
      'ext-1',
      'student',
      'John',
      'john@anglo.local',
    );
    expect(req.integrationUser).toEqual(resolvedUser);
    expect(next).toHaveBeenCalledOnce();
  });

  it('should default integrationName to "default" when not provided', async () => {
    mockIntegrationService.resolveOrCreateUser.mockResolvedValue({
      userId: 'user-1',
      externalUserId: 'ext-1',
      externalRole: 'student',
      integrationName: 'default',
      isNewUser: true,
    });

    const req = createMockRequest({
      'x-api-key': 'test-api-key',
      'x-integration-user-id': 'ext-1',
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware.use(req, res, next);

    expect(mockIntegrationService.resolveOrCreateUser).toHaveBeenCalledWith(
      'default',
      'ext-1',
      'student',
      undefined,
      undefined,
    );
  });

  it('should default externalRole to "student" when not provided', async () => {
    mockIntegrationService.resolveOrCreateUser.mockResolvedValue({
      userId: 'user-1',
      externalUserId: 'ext-1',
      externalRole: 'student',
      integrationName: 'anglo-platform',
      isNewUser: true,
    });

    const req = createMockRequest({
      'x-api-key': 'test-api-key',
      'x-integration-user-id': 'ext-1',
      'x-integration-name': 'anglo-platform',
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware.use(req, res, next);

    expect(mockIntegrationService.resolveOrCreateUser).toHaveBeenCalledWith(
      'anglo-platform',
      'ext-1',
      'student',
      undefined,
      undefined,
    );
  });

  it('should call next() even when resolveOrCreateUser throws', async () => {
    mockIntegrationService.resolveOrCreateUser.mockRejectedValue(new Error('DB error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const req = createMockRequest({
      'x-api-key': 'test-api-key',
      'x-integration-user-id': 'ext-1',
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware.use(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.integrationUser).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
