import { Controller, Get, Post, Req, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { type UserSession, Session } from '@thallesp/nestjs-better-auth';
import type { Request } from 'express';
import { LegalService } from './legal.service';

@ApiTags('Legal')
@Controller('legal')
@ApiBearerAuth()
export class LegalController {
  private readonly logger = new Logger(LegalController.name);

  constructor(private readonly legalService: LegalService) {}

  @Get('terms/status')
  @ApiOperation({
    summary: 'Status do aceite dos Termos de Uso',
    description: 'Verifica se o usuário aceitou a versão vigente dos Termos de Uso.',
  })
  async getTermsStatus(@Session() session: UserSession) {
    return this.legalService.getTermsStatus(session.user.id);
  }

  @Post('terms/accept')
  @ApiOperation({
    summary: 'Aceitar Termos de Uso',
    description: 'Registra o aceite da versão vigente dos Termos de Uso pelo usuário autenticado.',
  })
  async acceptTerms(@Session() session: UserSession, @Req() req: Request) {
    const ipAddress = req.ip ?? req.socket.remoteAddress ?? null;
    const userAgent = req.headers['user-agent'] ?? null;

    return this.legalService.acceptTerms(session.user.id, ipAddress, userAgent);
  }
}
