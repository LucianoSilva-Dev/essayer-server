import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { IntegrationService } from './integration.service';

export interface IIntegrationRequest extends Request {
  integrationUser?: {
    userId: string;
    externalUserId: string;
    externalRole: string;
    integrationName: string;
    isNewUser: boolean;
  };
  session?: {
    user: {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
      image: string | null;
      role?: string;
      createdAt: Date;
      updatedAt: Date;
      // biome-ignore lint/suspicious/noExplicitAny: better-auth session can have additional fields
    } & Record<string, any>;
  };
  // biome-ignore lint/suspicious/noExplicitAny: better-auth session user can have additional fields
  user?: any;
}

@Injectable()
export class IntegrationUserMiddleware implements NestMiddleware {
  constructor(private readonly integrationService: IntegrationService) { }

  async use(req: IIntegrationRequest, _: Response, next: NextFunction) {
    const externalUserId = req.headers['x-integration-user-id'] as string | undefined;

    // If no integration user ID, skip middleware
    if (!externalUserId) {
      return next();
    }

    const apiKey = req.headers['x-api-key'] as string | undefined;

    // If no API key, skip middleware (not an integration request)
    if (!apiKey) {
      return next();
    }

    try {
      const integrationName = (req.headers['x-integration-name'] as string) || 'default';
      const externalRole = (req.headers['x-integration-user-role'] as string) || 'student';
      const userName = req.headers['x-integration-user-name'] as string | undefined;
      const userEmail = req.headers['x-integration-user-email'] as string | undefined;

      const resolved = await this.integrationService.resolveOrCreateUser(
        integrationName,
        externalUserId,
        externalRole,
        userName,
        userEmail,
      );

      req.integrationUser = resolved;
    } catch (error) {
      console.error('[IntegrationUserMiddleware] Error resolving integration user:', error);
      // Don't fail the request, let the AuthGuard in the next step handle it
    }

    next();
  }
}
