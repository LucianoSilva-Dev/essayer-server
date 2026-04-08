import { Injectable } from '@nestjs/common';
import { IntegrationRepository } from './integration.repository';
import { IResolvedIntegrationUser } from './types';

@Injectable()
export class IntegrationService {
  constructor(private readonly repository: IntegrationRepository) { }

  async resolveOrCreateUser(
    integrationName: string,
    externalUserId: string,
    externalRole: string = 'student',
    userName?: string,
    userEmail?: string,
  ): Promise<IResolvedIntegrationUser> {
    // Check if integration user mapping already exists
    let integrationUser = await this.repository.findIntegrationUser(
      integrationName,
      externalUserId,
    );

    if (integrationUser) {
      // User already provisioned, just return mapped user
      return {
        userId: integrationUser.userId,
        externalUserId: integrationUser.externalUserId,
        externalRole: integrationUser.externalRole,
        integrationName,
        isNewUser: false,
      };
    }

    // Need to create new user mapping
    // First, check if user already exists by email
    let user = null;
    if (userEmail) {
      user = await this.repository.findUserByEmail(userEmail);
    }

    // If user doesn't exist, create a new one
    if (!user) {
      if (!userName || !userEmail) {
        throw new Error(
          `Cannot auto-provision user: missing userName (${userName}) or userEmail (${userEmail})`,
        );
      }

      user = await this.repository.createUser({
        email: userEmail,
        name: userName,
        emailVerified: true,
      });
    }

    // Create integration user mapping
    integrationUser = await this.repository.createIntegrationUser({
      integrationName,
      userId: user.id,
      externalUserId,
      externalRole,
    });

    return {
      userId: integrationUser.userId,
      externalUserId: integrationUser.externalUserId,
      externalRole: integrationUser.externalRole,
      integrationName,
      isNewUser: true,
    };
  }
}
