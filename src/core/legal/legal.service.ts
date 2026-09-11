import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { CURRENT_TERMS_VERSION } from './legal.constants';

@Injectable()
export class LegalService {
  private readonly logger = new Logger(LegalService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getTermsStatus(userId: string) {
    const acceptance = await this.prisma.legalDocumentAcceptance.findUnique({
      where: {
        userId_documentType_version: {
          userId,
          documentType: 'TERMS_OF_USE',
          version: CURRENT_TERMS_VERSION,
        },
      },
    });

    return {
      currentVersion: CURRENT_TERMS_VERSION,
      accepted: !!acceptance,
      acceptedAt: acceptance?.acceptedAt ?? null,
    };
  }

  async acceptTerms(userId: string, ipAddress: string | null, userAgent: string | null) {
    const acceptance = await this.prisma.legalDocumentAcceptance.upsert({
      where: {
        userId_documentType_version: {
          userId,
          documentType: 'TERMS_OF_USE',
          version: CURRENT_TERMS_VERSION,
        },
      },
      create: {
        userId,
        documentType: 'TERMS_OF_USE',
        version: CURRENT_TERMS_VERSION,
        ipAddress,
        userAgent,
      },
      update: {},
    });

    this.logger.log(`Terms accepted by user ${userId} (version ${CURRENT_TERMS_VERSION})`);

    return {
      accepted: true,
      version: CURRENT_TERMS_VERSION,
      acceptedAt: acceptance.acceptedAt,
    };
  }
}
