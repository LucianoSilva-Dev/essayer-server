import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LegalService } from './legal.service';
import { SKIP_TERMS_CHECK_KEY } from './skip-terms-check.decorator';

@Injectable()
export class TermsAcceptanceGuard implements CanActivate {
  constructor(
    private readonly legalService: LegalService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_TERMS_CHECK_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id ?? request.session?.user?.id;
    if (!userId) return true; // Rota anônima — AuthGuard cuida disso

    const status = await this.legalService.getTermsStatus(userId);
    if (!status.accepted) {
      throw new ForbiddenException({
        code: 'TERMS_NOT_ACCEPTED',
        message: 'Você precisa aceitar os Termos de Uso para continuar.',
        currentVersion: status.currentVersion,
      });
    }

    return true;
  }
}
