import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LegalService } from './legal.service';
import { PrismaService } from '@core/prisma/prisma.service';
import { CURRENT_TERMS_VERSION } from './legal.constants';

describe('LegalService (essayer-server)', () => {
  let service: LegalService;
  let prismaService: {
    legalDocumentAcceptance: {
      findUnique: ReturnType<typeof vi.fn>;
      upsert: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prismaService = {
      legalDocumentAcceptance: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
    };

    service = new LegalService(prismaService as unknown as PrismaService);
  });

  it('deve retornar accepted=false para usuário sem aceite', async () => {
    prismaService.legalDocumentAcceptance.findUnique.mockResolvedValue(null);

    const status = await service.getTermsStatus('user-without-terms');

    expect(status.accepted).toBe(false);
    expect(status.acceptedAt).toBeNull();
    expect(status.currentVersion).toBe(CURRENT_TERMS_VERSION);
    expect(prismaService.legalDocumentAcceptance.findUnique).toHaveBeenCalledWith({
      where: {
        userId_documentType_version: {
          userId: 'user-without-terms',
          documentType: 'TERMS_OF_USE',
          version: CURRENT_TERMS_VERSION,
        },
      },
    });
  });

  it('deve retornar accepted=true para usuário com aceite na versão atual', async () => {
    const acceptedAt = new Date();
    prismaService.legalDocumentAcceptance.findUnique.mockResolvedValue({
      id: 'acc-1',
      userId: 'user-with-terms',
      documentType: 'TERMS_OF_USE',
      version: CURRENT_TERMS_VERSION,
      acceptedAt,
    });

    const status = await service.getTermsStatus('user-with-terms');

    expect(status.accepted).toBe(true);
    expect(status.acceptedAt).toBe(acceptedAt);
    expect(status.currentVersion).toBe(CURRENT_TERMS_VERSION);
  });

  it('deve retornar accepted=false para usuário com aceite em versão desatualizada', async () => {
    prismaService.legalDocumentAcceptance.findUnique.mockResolvedValue(null);

    const status = await service.getTermsStatus('user-with-old-terms');

    expect(status.accepted).toBe(false);
    expect(status.currentVersion).toBe(CURRENT_TERMS_VERSION);
    expect(prismaService.legalDocumentAcceptance.findUnique).toHaveBeenCalledWith({
      where: {
        userId_documentType_version: {
          userId: 'user-with-old-terms',
          documentType: 'TERMS_OF_USE',
          version: CURRENT_TERMS_VERSION,
        },
      },
    });
  });

  it('deve registrar aceite com IP e User-Agent', async () => {
    const acceptedAt = new Date();
    prismaService.legalDocumentAcceptance.upsert.mockResolvedValue({
      id: 'acc-1',
      userId: 'user-1',
      documentType: 'TERMS_OF_USE',
      version: CURRENT_TERMS_VERSION,
      acceptedAt,
      ipAddress: '192.168.1.50',
      userAgent: 'Mozilla/5.0 Test',
    });

    const result = await service.acceptTerms('user-1', '192.168.1.50', 'Mozilla/5.0 Test');

    expect(result.accepted).toBe(true);
    expect(result.version).toBe(CURRENT_TERMS_VERSION);
    expect(prismaService.legalDocumentAcceptance.upsert).toHaveBeenCalledWith({
      where: {
        userId_documentType_version: {
          userId: 'user-1',
          documentType: 'TERMS_OF_USE',
          version: CURRENT_TERMS_VERSION,
        },
      },
      create: {
        userId: 'user-1',
        documentType: 'TERMS_OF_USE',
        version: CURRENT_TERMS_VERSION,
        ipAddress: '192.168.1.50',
        userAgent: 'Mozilla/5.0 Test',
      },
      update: {},
    });
  });

  it('deve ser idempotente (upsert)', async () => {
    const acceptedAt = new Date();
    prismaService.legalDocumentAcceptance.upsert.mockResolvedValue({
      id: 'acc-1',
      userId: 'user-1',
      documentType: 'TERMS_OF_USE',
      version: CURRENT_TERMS_VERSION,
      acceptedAt,
    });

    const first = await service.acceptTerms('user-1', '1.1.1.1', 'Agent 1');
    const second = await service.acceptTerms('user-1', '1.1.1.1', 'Agent 1');

    expect(first.accepted).toBe(true);
    expect(second.accepted).toBe(true);
    expect(prismaService.legalDocumentAcceptance.upsert).toHaveBeenCalledTimes(2);
  });

  it('não deve expor aceite de outro usuário', async () => {
    prismaService.legalDocumentAcceptance.findUnique.mockImplementation(
      ({ where }: { where: { userId_documentType_version: { userId: string } } }) => {
        if (where.userId_documentType_version.userId === 'user-A') {
          return Promise.resolve({
            id: 'acc-A',
            userId: 'user-A',
            documentType: 'TERMS_OF_USE',
            version: CURRENT_TERMS_VERSION,
            acceptedAt: new Date(),
          });
        }
        return Promise.resolve(null);
      },
    );

    const statusA = await service.getTermsStatus('user-A');
    const statusB = await service.getTermsStatus('user-B');

    expect(statusA.accepted).toBe(true);
    expect(statusB.accepted).toBe(false);
  });
});
