import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { IIntegrationRequest } from './integration.middleware';
import { IntegrationRepository } from './integration.repository';

@Injectable()
export class IntegrationUserGuard implements CanActivate {
  constructor(private readonly repository: IntegrationRepository) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IIntegrationRequest>();
    const integrationUser = request.integrationUser;

    if (integrationUser && request.session) {
      try {
        // Fetch the actual user from the database (no need to fetch again, we can use cache or direct mapping)
        const user = await this.repository.findUserById(integrationUser.userId);

        if (user) {
          // Replace the mock session user (service user) with the actual provisioned user
          request.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image ?? null,
            role: user.role ?? integrationUser.externalRole,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            // biome-ignore lint/suspicious/noExplicitAny: better-auth session object can have additional fields
          } as any;
          request.user = request.session.user;
        }
      } catch (error) {
        console.error('[IntegrationUserGuard] Error updating session user:', error);
        // Don't fail, let the request proceed with the current session
      }
    }

    return true;
  }
}
