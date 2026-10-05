import { PrismaModule } from '@core/prisma';
import { Module } from '@nestjs/common';
import { LegalController } from './legal.controller';
import { LegalService } from './legal.service';
import { TermsAcceptanceGuard } from './terms-acceptance.guard';

@Module({
  imports: [PrismaModule],
  controllers: [LegalController],
  providers: [LegalService, TermsAcceptanceGuard],
  exports: [LegalService, TermsAcceptanceGuard],
})
export class LegalModule {}
