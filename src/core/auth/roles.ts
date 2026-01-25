import { createAccessControl } from 'better-auth/plugins/access';

/**
 * Access Control Statement
 *
 * Define resources and their allowed actions for the application.
 * Using `as const` for proper TypeScript type inference.
 */
export const statement = {
  // User management (default admin plugin actions)
  user: ['create', 'list', 'set-role', 'ban', 'impersonate', 'delete', 'set-password'],
  // Session management
  session: ['list', 'revoke', 'delete'],
} as const;

export const ac = createAccessControl(statement);

/**
 * Role: Student (aluno)
 * - No special permissions
 * - Default role for new users
 */
export const student = ac.newRole({
  user: [],
  session: [],
});

/**
 * Role: Teacher (professor)
 * - Can manage their own classes and activities
 * - No admin permissions over users
 */
export const teacher = ac.newRole({
  user: [],
  session: [],
});

/**
 * Role: Admin
 * - Full access to all user management functions
 * - Full access to session management
 */
export const admin = ac.newRole({
  user: ['create', 'list', 'set-role', 'ban', 'impersonate', 'delete', 'set-password'],
  session: ['list', 'revoke', 'delete'],
});
