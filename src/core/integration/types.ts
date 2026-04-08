export const INTEGRATION_SERVICE = Symbol('INTEGRATION_SERVICE');

export interface IResolvedIntegrationUser {
  userId: string;
  externalUserId: string;
  externalRole: string;
  integrationName: string;
  isNewUser: boolean;
}

export const INTEGRATION_SCOPES = {
  REPERTOIRES_READ: 'repertoires:read',
  REPERTOIRES_WRITE: 'repertoires:write',
  USERS_PROVISION: 'users:provision',
  USERS_SYNC_TEACHER: 'users:sync-teacher',
} as const;

export type IntegrationScope = (typeof INTEGRATION_SCOPES)[keyof typeof INTEGRATION_SCOPES];
