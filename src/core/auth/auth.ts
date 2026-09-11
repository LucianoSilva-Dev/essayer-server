import { apiKey } from '@better-auth/api-key';
import { PrismaPg } from '@prisma/adapter-pg';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin as adminPlugin, openAPI } from 'better-auth/plugins';
import { PrismaClient } from '../prisma/generated/client';
import {
  betterAuthLogger,
  sendChangeEmailConfirmation,
  sendResetPassword,
  sendVerificationEmail,
} from './helpers';
import { ac, admin, student, teacher } from './roles';

// Create a separate PrismaClient instance for better-auth
// This is necessary because better-auth manages its own database connections
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail,
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword,
    revokeSessionsOnPasswordReset: true,
  },

  user: {
    additionalFields: {
      lattes: {
        type: 'string',
        required: false,
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation,
      updateEmailWithoutVerification: true,
    },
  },

  basePath: '/auth',

  logger: {
    level: 'debug',
    log: betterAuthLogger,
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 15, // 15 minutes
    },
  },

  advanced: {
    database: {
      generateId: false, // Let the database generate IDs (UUIDv7)
    },
    defaultCookieAttributes: {
      sameSite: 'none',
    },
    cookies: {
      // biome-ignore lint/style/useNamingConvention: better-auth API requires snake_case
      session_token: {
        attributes: {
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
          sameSite: 'none',
          secure: process.env.NODE_ENV === 'production',
        },
      },
      // biome-ignore lint/style/useNamingConvention: better-auth API requires snake_case
      session_data: {
        attributes: {
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
          sameSite: 'none',
          secure: process.env.NODE_ENV === 'production',
        },
      },
    },
  },

  trustedOrigins: process.env.TRUSTED_ORIGINS
    ? process.env.TRUSTED_ORIGINS.split(',')
    : process.env.NODE_ENV === 'production'
      ? []
      : ['http://localhost:3000', 'http://localhost:5173'],

  plugins: [
    openAPI({ path: '/auth/docs', disableDefaultReference: true }),
    adminPlugin({
      ac,
      roles: { admin, teacher, student },
      defaultRole: 'student',
    }),
    apiKey({
      // biome-ignore lint/style/useNamingConvention: better-auth API uses consecutive uppercase
      enableSessionForAPIKeys: true,
      requireName: true,
      enableMetadata: true,
      rateLimit: {
        enabled: false,
      },
      permissions: {
        defaultPermissions: {
          repertoires: ['read', 'write'],
          users: ['provision'],
        },
      },
    }),
  ],
});

// Export type for session inference
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

// Export roles constants for use in guards
export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
